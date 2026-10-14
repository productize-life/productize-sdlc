#!/usr/bin/env node
const fs = require("node:fs");
const vm = require("node:vm");

const file = process.argv.find((arg) => arg.endsWith(".html")) || "decision-page.html";
const html = fs.readFileSync(file, "utf8");

function extractDecision(source) {
  const match = source.match(/<script\s+type="application\/json"\s+id="decision">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("decision JSON script not found");
  return match[1].trim();
}

function extractRenderer(source) {
  const matches = [...source.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)];
  if (!matches.length) throw new Error("renderer script not found");
  return matches[matches.length - 1][1].trim();
}

if (process.argv.includes("--extract-renderer")) {
  process.stdout.write(extractRenderer(html) + "\n");
  process.exit(0);
}

const renderer = extractRenderer(html);
const example = JSON.parse(extractDecision(html));

function safeJson(value) {
  return JSON.stringify(value, null, 2).replace(/[<>&]/g, (c) => ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" }[c]));
}

function hashQuestion(q) {
  const s = JSON.stringify([q.title || "", (q.options || []).map((o) => String(o.v ?? ""))]);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

async function render(data, store = {}) {
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
    navigator: { clipboard: { writeText: async () => undefined } },
    window: {}
  };

  vm.runInNewContext(renderer, context, { filename: file });
  await new Promise((resolve) => setImmediate(resolve));
  return {
    root: element("root"),
    qs: element("qs"),
    send: element("send"),
    store,
    document
  };
}

function count(haystack, needle) {
  return (haystack.match(new RegExp(needle, "g")) || []).length;
}

(async () => {
  const rendered = await render(example);
  const rootHtml = rendered.root.innerHTML;
  const qsHtml = rendered.qs.innerHTML;
  const blockersIndex = rootHtml.indexOf('id="acceptance-blockers"');
  const ctaIndex = rootHtml.indexOf('data-role="cta"');
  const questionForms = count(qsHtml, "<form\\b");

  console.log("viewport: iphone-12-mini-390x844");
  console.log("section count:", count(rootHtml, "<section\\b"));
  console.log("blockers index:", blockersIndex);
  console.log("cta index:", ctaIndex);
  console.log("blockers before CTA:", blockersIndex >= 0 && ctaIndex >= 0 && blockersIndex < ctaIndex);
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
  store[`decision-answers:${stale.meta.id}`] = JSON.stringify({
    [q.id]: {
      decisionId: stale.meta.id,
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

  const ok = blockersIndex >= 0
    && ctaIndex >= 0
    && blockersIndex < ctaIndex
    && questionForms === example.questions.length
    && injectedHtml.includes("&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;")
    && !injectedHtml.includes("<img")
    && bareRecHtml.includes("Recommendation without its reason")
    && okHtml.includes("Recommended because:") && okHtml.includes("Strongest alternative")
    && badLinkHtml.includes("Bad link")
    && !/href="javascript:/i.test(badLinkHtml)
    && staleRender.qs.innerHTML.includes("needs a new answer")
    && staleRender.send.disabled === true
    && missingRawHtml.includes("Missing raw evidence for decoy-red row.");

  if (!ok) {
    process.exitCode = 1;
    console.error("check failed");
  }
})();
