#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const vm = require("node:vm");

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--")) || "decision-page.html";
const html = fs.readFileSync(file, "utf8");

function extractDecision(source) {
  const match = source.match(/<script\s+type="application\/json"\s+id="decision">([\s\S]*?)<\/script>/);
  if (!match && /<script/i.test(source)) throw new Error("decision JSON script not found");
  if (!match) return source.trim();
  return match[1].trim();
}

function extractRenderer(source) {
  const matches = [...source.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)];
  if (!matches.length) throw new Error("renderer script not found");
  return matches[matches.length - 1][1].trim();
}

function parseDecision(source) {
  return JSON.parse(extractDecision(source));
}

function pathLabel(parts) {
  return parts.length ? parts.join(".").replace(/\.(\d+)(\.|$)/g, "[$1]$2").replace(/\.$/, "") : "<root>";
}

function validateDecision(data) {
  const errors = [];
  if (data && data.example === true) errors.push("example must be false");
  if (!String(data?.meta?.id || "").trim()) errors.push("empty meta.id");
  for (const [i, row] of (data.evidence || []).entries()) {
    if (row && row.status === "decoy-red" && !row.raw) errors.push(`decoy-red row without raw at evidence[${i}]`);
  }
  for (const [i, q] of (data.questions || []).entries()) {
    if (!Array.isArray(q.options) || q.options.length === 0) errors.push(`empty options at questions[${i}]`);
    const recs = (q.options || []).filter((o) => o && o.rec);
    for (const rec of recs) {
      const alt = q.strongest_alternative;
      const altOpt = alt && (q.options || []).find((o) => o && o.v === alt.v && !o.rec);
      if (!rec.why || !alt || !alt.why || !altOpt) errors.push(`rec without why/strongest_alternative at questions[${i}]`);
    }
  }
  for (const [i, item] of (data.dissent || []).entries()) {
    if (!item || typeof item.resolved !== "boolean") errors.push(`dissent without explicit resolved boolean at dissent[${i}]`);
  }
  function walk(value, parts = []) {
    if (!value || typeof value !== "object") return;
    if (Object.prototype.hasOwnProperty.call(value, "href")) {
      let ok = false;
      try {
        const url = new URL(String(value.href || ""));
        ok = url.protocol === "http:" || url.protocol === "https:";
      } catch {
        ok = false;
      }
      if (!ok) errors.push(`non-http(s) link at ${pathLabel([...parts, "href"])}`);
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, [...parts, String(i)]));
    } else {
      for (const [key, item] of Object.entries(value)) walk(item, [...parts, key]);
    }
  }
  walk(data);
  return errors;
}

if (args.includes("--validate")) {
  let data;
  try {
    data = parseDecision(html);
  } catch (e) {
    console.error("validate failed: invalid JSON: " + e.message);
    process.exit(1);
  }
  const errors = validateDecision(data);
  if (errors.length) {
    for (const error of errors) console.error("validate failed: " + error);
    process.exit(1);
  }
  console.log("validate ok:", file);
  process.exit(0);
}

if (args.includes("--extract-renderer")) {
  process.stdout.write(extractRenderer(html) + "\n");
  process.exit(0);
}

const renderer = extractRenderer(html);
const example = parseDecision(html);

function safeJson(value) {
  return JSON.stringify(value, null, 2).replace(/[<>&]/g, (c) => ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" }[c]));
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function questionShape(q) {
  return [
    String(q.id || ""),
    String(q.title || ""),
    String(q.context || ""),
    (q.options || []).map((o) => [String(o.v ?? ""), String(o.label ?? ""), o.rec === true ? String(o.why ?? "") : null]),
    q.strongest_alternative ? [String(q.strongest_alternative.v ?? ""), String(q.strongest_alternative.why ?? "")] : null
  ];
}

function hashQuestion(q) {
  return hashString(JSON.stringify(questionShape(q)));
}

function hashQuestions(qs) {
  return hashString(JSON.stringify((qs || []).map(questionShape)));
}

function answerRows(data, qsVersion = hashQuestions(data.questions)) {
  const out = {};
  for (const q of data.questions || []) {
    out[q.id] = {
      decisionId: data.meta.id,
      qsVersion,
      questionHash: hashQuestion(q),
      choice: q.options[0].v,
      note: "",
      answeredAt: "2026-10-14T00:00:00.000Z"
    };
  }
  return out;
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function makeDb(initial = {}) {
  const data = {};
  const writes = [];
  for (const [collection, docs] of Object.entries(initial)) data[collection] = clone(docs);
  return {
    writes,
    data,
    collection(name) {
      if (!data[name]) data[name] = {};
      return {
        doc(id) {
          return {
            async set(row) {
              writes.push({ collection: name, id, row: clone(row) });
              data[name][id] = clone(row);
            },
            async get() {
              if (!Object.prototype.hasOwnProperty.call(data[name], id)) return { exists: false, data: () => undefined };
              return { exists: true, id, data: () => clone(data[name][id]) };
            }
          };
        },
        onSnapshot(fn) {
          fn({ docs: Object.entries(data[name]).map(([id, row]) => ({ id, data: () => clone(row) })) });
          return () => undefined;
        }
      };
    }
  };
}

function makeClaude({ db = null, owner = true, userId = "owner-1", dbError = null } = {}) {
  return {
    async use(name) {
      if (name === "db") {
        if (dbError) throw dbError;
        return db;
      }
      if (name === "user") return {
        async isOwner() { return owner; },
        async id() { return userId; }
      };
      throw new Error("unknown capability " + name);
    }
  };
}

const answerCollection = (decisionId) => `answers/${decisionId || "missing-decision-id"}`;
const handoffCollection = (decisionId) => `handoff/${decisionId || "missing-decision-id"}`;

async function render(data, store = {}, options = {}) {
  const elements = new Map();

  class Element {
    constructor(id) {
      this.id = id;
      this._innerHTML = "";
      this.textContent = "";
      this.disabled = false;
      this.listeners = {};
    }

    get innerHTML() {
      return this._innerHTML;
    }

    set innerHTML(value) {
      this._innerHTML = String(value);
      registerIds(this._innerHTML);
    }

    addEventListener(type, fn) {
      this.listeners[type] = fn;
    }
  }

  function element(id) {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  }

  function registerIds(markup) {
    for (const match of String(markup).matchAll(/\sid="([^"]+)"/g)) element(match[1]);
  }

  element("root");
  element("decision").textContent = safeJson(data);

  const localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    }
  };

  const document = {
    title: "",
    getElementById: element
  };

  const clipboard = { text: "", writeText: async (text) => { clipboard.text = String(text); } };
  const context = {
    Date,
    JSON,
    Math,
    Object,
    RegExp,
    String,
    URL,
    console,
    document,
    localStorage,
    navigator: { clipboard },
    window: {}
  };
  if (options.claude) context.window.claude = options.claude;

  vm.runInNewContext(renderer, context, { filename: file });
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  await Promise.resolve();
  return {
    root: element("root"),
    qs: element("qs"),
    send: element("send"),
    sendStatus: element("send-status"),
    handoff: element("handoff"),
    modeBanner: element("hitl-mode-banner"),
    store,
    document,
    clipboard
  };
}

function count(haystack, needle) {
  return (haystack.match(new RegExp(needle, "g")) || []).length;
}

function htmlWithDecision(data) {
  if (!/<script\s+type="application\/json"\s+id="decision">/.test(html)) return safeJson(data);
  return html.replace(
    /(<script\s+type="application\/json"\s+id="decision">)([\s\S]*?)(<\/script>)/,
    (_, start, __, end) => start + "\n" + safeJson(data) + "\n" + end
  );
}

function validateExitsOne(name, mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "decision-page-"));
  const target = path.join(dir, `${name}.html`);
  const data = structuredClone(example);
  mutate(data);
  fs.writeFileSync(target, htmlWithDecision(data));
  const result = spawnSync(process.execPath, [__filename, "--validate", target], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result.status === 1;
}

(async () => {
  const rendered = await render(example);
  const rootHtml = rendered.root.innerHTML;
  const qsHtml = rendered.qs.innerHTML;
  const blockersIndex = rootHtml.indexOf('id="acceptance-blockers"');
  const ctaIndex = rootHtml.indexOf('data-role="cta"');
  const questionForms = count(qsHtml, "<form\\b");
  const blockerLines = count(rootHtml, '<details class="blocker-line"');
  const expectedBlockers = (example.dissent || []).filter((x) => x.resolved !== true).length
    + (example.evidence || []).filter((e) => e && (e.self_reported === true || e.selfReported === true || /self[-\s]?reported/i.test(String(e.note || "")))).length
    + (example.open || []).length;

  console.log("viewport: iphone-12-mini-390x844");
  console.log("section count:", count(rootHtml, "<section\\b"));
  console.log("blockers index:", blockersIndex);
  console.log("cta index:", ctaIndex);
  console.log("blockers before CTA:", blockersIndex >= 0 && ctaIndex >= 0 && blockersIndex < ctaIndex);
  console.log("blockers one line per blocker:", blockerLines === expectedBlockers);
  console.log("question forms count:", questionForms);

  const injected = structuredClone(example);
  injected.subtitle = "</script><img src=x onerror=alert(1)>";
  const injectedRender = await render(injected);
  const injectedHtml = injectedRender.root.innerHTML;
  console.log("negative escaped script text:", injectedHtml.includes("&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;"));
  console.log("negative escaped script raw img:", injectedHtml.includes("<img"));

  const badLink = structuredClone(example);
  badLink.ask.link = { label: "Bad link", href: "javascript:alert(1)" };
  const badLinkHtml = (await render(badLink)).root.innerHTML;
  console.log("negative javascript link plain text:", badLinkHtml.includes("Bad link"));
  console.log("negative javascript link href:", /href="javascript:/i.test(badLinkHtml));

  const stale = structuredClone(example);
  const q = stale.questions[0];
  const store = {};
  const staleQsVersion = hashQuestions(stale.questions);
  store[`decision-answers:${stale.meta.id}`] = JSON.stringify({
    [q.id]: {
      decisionId: stale.meta.id,
      qsVersion: staleQsVersion,
      questionHash: hashQuestion(q),
      choice: q.options[0].v,
      note: "",
      answeredAt: "2026-10-14T00:00:00.000Z"
    }
  });
  stale.questions[0].options[0].v = "approve-after-review";
  const staleRender = await render(stale, store);
  console.log("negative stale answer notice:", staleRender.qs.innerHTML.includes("needs a new answer"));
  console.log("negative stale send disabled:", staleRender.send.disabled === true);

  const recWhy = structuredClone(example);
  const recWhyStore = {};
  const recWhyVersion = hashQuestions(recWhy.questions);
  recWhyStore[`decision-answers:${recWhy.meta.id}`] = JSON.stringify({
    [recWhy.questions[0].id]: {
      decisionId: recWhy.meta.id,
      qsVersion: recWhyVersion,
      questionHash: hashQuestion(recWhy.questions[0]),
      choice: recWhy.questions[0].options[0].v,
      note: "",
      answeredAt: "2026-10-14T00:00:00.000Z"
    }
  });
  recWhy.questions[0].options[0].why = recWhy.questions[0].options[0].why + " Extra scrutiny added.";
  const recWhyRender = await render(recWhy, recWhyStore);
  const recWhyStale = recWhyRender.qs.innerHTML.includes("needs a new answer") && recWhyRender.send.disabled === true;
  console.log("negative rec.why changes qsVersion and stales answer:", recWhyStale);

  const missingRaw = structuredClone(example);
  const decoy = missingRaw.evidence.find((row) => row.status === "decoy-red");
  delete decoy.raw;
  const missingRawHtml = (await render(missingRaw)).root.innerHTML;
  console.log("negative decoy raw error:", missingRawHtml.includes("Missing raw evidence for decoy-red row."));

  const bareRec = structuredClone(example);
  delete bareRec.questions[0].strongest_alternative;
  const bareRecRender = await render(bareRec);
  const bareRecHtml = (bareRecRender.qs || bareRecRender.root).innerHTML;
  console.log("negative rec without alternative error:", bareRecHtml.includes("Recommendation without its reason"));
  const okRender = await render(example);
  const okHtml = (okRender.qs || okRender.root).innerHTML;
  console.log("rec shows reason and alternative:", okHtml.includes("Recommended because:") && okHtml.includes("Strongest alternative"));

  const currentQsVersion = hashQuestions(example.questions);
  const currentAnswers = answerRows(example, currentQsVersion);

  const nonOwnerDb = makeDb({ [answerCollection(example.meta.id)]: currentAnswers });
  const nonOwnerRender = await render(example, {}, { claude: makeClaude({ db: nonOwnerDb, owner: false }) });
  const nonOwnerOk = nonOwnerRender.send.disabled === true
    && nonOwnerRender.modeBanner.innerHTML.includes("Only the owner can send answers.")
    && nonOwnerRender.qs.innerHTML.includes(" disabled");
  console.log("negative non-owner viewer send disabled + read-only text:", nonOwnerOk);

  const staleSubmissionDb = makeDb({
    [answerCollection(example.meta.id)]: currentAnswers,
    [handoffCollection(example.meta.id)]: {
      submission: { decisionId: example.meta.id, qsVersion: "00000000", status: "submitted", at: "2026-10-14T00:00:00.000Z" },
      agent: { decisionId: example.meta.id, state: "done", result: "old done" }
    }
  });
  const staleSubmissionRender = await render(example, {}, { claude: makeClaude({ db: staleSubmissionDb, owner: true }) });
  await staleSubmissionRender.send.listeners.click();
  const staleSubmissionRefusal = staleSubmissionRender.sendStatus.textContent.includes("This tab is out of date, reload");
  const staleSubmissionNoWrite = staleSubmissionDb.writes.length === 0;
  console.log("negative stale submission qsVersion refusal:", staleSubmissionRefusal);
  console.log("negative stale submission no write:", staleSubmissionNoWrite);

  const handedOffDb = makeDb({
    [answerCollection(example.meta.id)]: currentAnswers,
    [handoffCollection(example.meta.id)]: {
      submission: { decisionId: example.meta.id, qsVersion: currentQsVersion, status: "submitted", at: "2026-10-14T00:00:00.000Z" },
      agent: { decisionId: example.meta.id, state: "handed-off", handedOff: "owner answers queued" }
    }
  });
  const handedOffRender = await render(example, {}, { claude: makeClaude({ db: handedOffDb, owner: true }) });
  await handedOffRender.send.listeners.click();
  const handedOffRefusal = handedOffRender.sendStatus.textContent.includes("This tab is out of date, reload");
  const handedOffNoWrite = handedOffDb.writes.length === 0;
  console.log("negative agent handed-off refusal:", handedOffRefusal);
  console.log("negative agent handed-off no write:", handedOffNoWrite);

  const otherDecisionId = example.meta.id + "-other";
  const otherDecisionDb = makeDb({
    [answerCollection(example.meta.id)]: currentAnswers,
    [handoffCollection(otherDecisionId)]: {
      submission: { decisionId: otherDecisionId, qsVersion: currentQsVersion, status: "submitted", at: "2026-10-14T00:00:00.000Z" },
      agent: { decisionId: otherDecisionId, state: "done", result: "other done" }
    }
  });
  const otherDecisionRender = await render(example, {}, { claude: makeClaude({ db: otherDecisionDb, owner: true }) });
  await otherDecisionRender.send.listeners.click();
  const otherDecisionIgnored = !otherDecisionRender.handoff.innerHTML.includes("other done")
    && otherDecisionDb.writes.some((w) => w.collection === handoffCollection(example.meta.id) && w.id === "submission")
    && !otherDecisionDb.writes.some((w) => w.collection === handoffCollection(otherDecisionId));
  console.log("negative other decisionId submission ignored:", otherDecisionIgnored);

  const browserStore = {};
  browserStore[`decision-answers:${example.meta.id}`] = JSON.stringify(currentAnswers);
  const browserRender = await render(example, browserStore);
  await browserRender.send.listeners.click();
  const browserText = [
    browserRender.root.innerHTML,
    browserRender.qs.innerHTML,
    browserRender.send.textContent,
    browserRender.sendStatus.textContent,
    browserRender.handoff.innerHTML,
    browserRender.modeBanner.innerHTML
  ].join(" ");
  const browserBanner = browserRender.modeBanner.innerHTML.includes("The agent cannot see answers on this page. Use Copy and send them where the agent reads.");
  const browserReason = browserRender.modeBanner.innerHTML.includes("no host");
  const browserNoSent = !/\bSent\b/.test(browserText);
  const browserPayload = JSON.parse(browserRender.clipboard.text);
  const browserPayloadHasVersion = browserPayload.decisionId === example.meta.id && browserPayload.qsVersion === currentQsVersion;
  console.log("negative browser-only blocking banner:", browserBanner);
  console.log("copy-mode no-host reason shown:", browserReason);
  console.log("negative browser-only no Sent text after send:", browserNoSent);
  console.log("copy-mode payload contains decisionId and qsVersion:", browserPayloadHasVersion);

  const dbDenied = new Error("db capability denied");
  dbDenied.code = "permission-denied";
  const copyReasonRender = await render(example, browserStore, { claude: makeClaude({ dbError: dbDenied, userId: "owner-copy" }) });
  const copyReason = copyReasonRender.modeBanner.innerHTML.includes("capability not granted: db")
    && copyReasonRender.modeBanner.innerHTML.includes("code permission-denied");
  await copyReasonRender.send.listeners.click();
  const ownerPayload = JSON.parse(copyReasonRender.clipboard.text);
  const copyOwner = ownerPayload.ownerId === "owner-copy";
  console.log("copy-mode shows db unavailable reason:", copyReason);
  console.log("copy-mode payload contains owner id when known:", copyOwner);

  const validateEmptyOptions = validateExitsOne("empty-options", (data) => { data.questions[0].options = []; });
  const validateExample = validateExitsOne("example-true", (data) => { data.example = true; });
  const validateMetaId = validateExitsOne("empty-meta-id", (data) => { data.meta.id = ""; });
  const validateDissentResolved = validateExitsOne("dissent-without-resolved", (data) => { delete data.dissent[0].resolved; });
  console.log("negative validate empty options exits 1:", validateEmptyOptions);
  console.log("negative validate example true exits 1:", validateExample);
  console.log("negative validate empty meta.id exits 1:", validateMetaId);
  console.log("negative validate dissent without resolved exits 1:", validateDissentResolved);

  const ok = blockersIndex >= 0
    && ctaIndex >= 0
    && blockersIndex < ctaIndex
    && blockerLines === expectedBlockers
    && questionForms === example.questions.length
    && injectedHtml.includes("&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;")
    && !injectedHtml.includes("<img")
    && bareRecHtml.includes("Recommendation without its reason")
    && okHtml.includes("Recommended because:") && okHtml.includes("Strongest alternative")
    && badLinkHtml.includes("Bad link")
    && !/href="javascript:/i.test(badLinkHtml)
    && staleRender.qs.innerHTML.includes("needs a new answer")
    && staleRender.send.disabled === true
    && recWhyStale
    && missingRawHtml.includes("Missing raw evidence for decoy-red row.")
    && nonOwnerOk
    && staleSubmissionRefusal
    && staleSubmissionNoWrite
    && handedOffRefusal
    && handedOffNoWrite
    && otherDecisionIgnored
    && browserBanner
    && browserReason
    && browserNoSent
    && browserPayloadHasVersion
    && copyReason
    && copyOwner
    && validateEmptyOptions
    && validateExample
    && validateMetaId
    && validateDissentResolved;

  if (!ok) {
    process.exitCode = 1;
    console.error("check failed");
  }
})();
