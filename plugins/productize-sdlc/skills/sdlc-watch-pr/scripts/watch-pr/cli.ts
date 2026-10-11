import { setTimeout as delay } from "node:timers/promises";
import {
  GhGitHubReader,
  WatcherQueryError,
  discoverStack,
  resolveContext,
} from "./github.ts";
import {
  runQueued,
  runSimple,
  statusQueryVerdict,
  verdictFactory,
  type WatchClock,
} from "./policy.ts";
import { renderJson, renderPretty } from "./render.ts";
import type * as T from "./types.ts";
import { nonEmpty, parsePrNumber } from "./types.ts";
export interface CliOptions {
  readonly owner: string | null;
  readonly repo: string | null;
  readonly pr: T.PrNumber | null;
  readonly mode: T.WatchMode;
  readonly stackPrs: readonly T.PrNumber[];
  readonly statusOnly: boolean;
  readonly pretty: boolean;
  readonly polling: T.PollingOptions;
}
class CliExit extends Error {
  constructor(readonly exitCode: number) {
    super(`CLI exit ${exitCode}`);
  }
}
type CliIo = Pick<CliRuntime, "stdout" | "stderr">;
const helpText = `Usage: watch-pr [options]

Watch one pull request, a connected stack, or an immutable queued stack.
JSON (NDJSON while polling) is the default; --pretty renders human text.

Options:
  --owner <owner>                 GitHub repository owner
  --repo <repo>                   GitHub repository name
  --pr <number>                   pull request number
  --stack                         watch the connected open stack
  --queued-stack                  watch the captured stack until all PRs merge
  --stack-prs <n,...>             frozen bottom-to-top queue (queued mode only)
  --interval <seconds>            poll interval (default: 60)
  --sweep-interval <seconds>      whole-stack sweep interval (default: 300)
  --timeout <seconds>             deadline; 0 disables it (default: 0)
  --max-query-errors <count>      consecutive query-error budget (default: 5)
  --status-only                   print one status table and exit 0
  --allow-draft                   do not treat a draft as a merge gate
  --pretty                        render human text instead of JSON
  -h, --help                      display help
`;
function usageError(io: CliIo, message: string): never {
  io.stderr(`error: ${message}\n`);
  throw new CliExit(64);
}
function requireValue(
  argv: readonly string[],
  index: number,
  option: string,
  io: CliIo
): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--"))
    usageError(io, `option '${option}' argument missing`);
  return value;
}
function positiveNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0)
    throw new Error("must be greater than zero");
  return parsed;
}
function nonNegativeNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error("must be zero or greater");
  return parsed;
}
function positiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0)
    throw new Error("must be a positive integer");
  return parsed;
}
function prNumber(value: string): T.PrNumber {
  try {
    return parsePrNumber(Number(value.replace(/^#/, "")));
  } catch {
    throw new Error("must be a positive integer");
  }
}
function stackPrList(value: string): T.NonEmpty<T.PrNumber> {
  const numbers = value.split(",").map((part) => prNumber(part.trim()));
  if (new Set(numbers).size !== numbers.length)
    throw new Error("contains a duplicate PR");
  const parsed = nonEmpty(numbers);
  if (parsed === null) throw new Error("cannot be empty");
  return parsed;
}
function parseValue<TValue>(
  value: string,
  option: string,
  label: string,
  parser: (value: string) => TValue,
  io: CliIo
): TValue {
  try {
    return parser(value);
  } catch (error) {
    const reason = error instanceof Error ? `. ${error.message}` : "";
    usageError(io, `option '${option} ${label}' argument '${value}' is invalid${reason}`);
  }
}
export function parseArgs(
  argv: readonly string[],
  io: CliIo
): CliOptions {
  const raw: {
    owner?: string;
    repo?: string;
    pr?: T.PrNumber;
    stack: boolean;
    queuedStack: boolean;
    stackPrs?: T.NonEmpty<T.PrNumber>;
    interval: number;
    sweepInterval: number;
    timeout: number;
    maxQueryErrors: number;
    statusOnly: boolean;
    allowDraft: boolean;
    pretty: boolean;
  } = {
    stack: false,
    queuedStack: false,
    interval: 60,
    sweepInterval: 300,
    timeout: 0,
    maxQueryErrors: 5,
    statusOnly: false,
    allowDraft: false,
    pretty: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--help":
      case "-h":
        io.stdout(helpText);
        throw new CliExit(0);
      case "--owner":
        raw.owner = requireValue(argv, index, arg, io);
        index += 1;
        break;
      case "--repo":
        raw.repo = requireValue(argv, index, arg, io);
        index += 1;
        break;
      case "--pr":
        raw.pr = parseValue(requireValue(argv, index, arg, io), arg, "<number>", prNumber, io);
        index += 1;
        break;
      case "--stack":
        raw.stack = true;
        break;
      case "--queued-stack":
        raw.queuedStack = true;
        break;
      case "--stack-prs":
        raw.stackPrs = parseValue(
          requireValue(argv, index, arg, io),
          arg,
          "<n,...>",
          stackPrList,
          io
        );
        index += 1;
        break;
      case "--interval":
        raw.interval = parseValue(
          requireValue(argv, index, arg, io),
          arg,
          "<seconds>",
          positiveNumber,
          io
        );
        index += 1;
        break;
      case "--sweep-interval":
        raw.sweepInterval = parseValue(
          requireValue(argv, index, arg, io),
          arg,
          "<seconds>",
          positiveNumber,
          io
        );
        index += 1;
        break;
      case "--timeout":
        raw.timeout = parseValue(
          requireValue(argv, index, arg, io),
          arg,
          "<seconds>",
          nonNegativeNumber,
          io
        );
        index += 1;
        break;
      case "--max-query-errors":
        raw.maxQueryErrors = parseValue(
          requireValue(argv, index, arg, io),
          arg,
          "<count>",
          positiveInteger,
          io
        );
        index += 1;
        break;
      case "--status-only":
        raw.statusOnly = true;
        break;
      case "--allow-draft":
        raw.allowDraft = true;
        break;
      case "--pretty":
        raw.pretty = true;
        break;
      default:
        usageError(io, `unknown option '${arg}'`);
    }
  }
  if (raw.stack && raw.queuedStack)
    usageError(io, "option '--stack' cannot be used with option '--queued-stack'");
  if (raw.stackPrs !== undefined && !raw.queuedStack)
    usageError(io, "--stack-prs requires --queued-stack");
  return {
    owner: raw.owner ?? null,
    repo: raw.repo ?? null,
    pr: raw.pr ?? null,
    mode: raw.queuedStack ? "queued-stack" : raw.stack ? "stack" : "single",
    stackPrs: raw.stackPrs ?? [],
    statusOnly: raw.statusOnly,
    pretty: raw.pretty,
    polling: {
      interval: raw.interval,
      sweepInterval: raw.sweepInterval,
      timeout: raw.timeout,
      maxQueryErrors: raw.maxQueryErrors,
      allowDraft: raw.allowDraft,
    },
  };
}
export interface CliRuntime {
  readonly reader: T.GitHubReader;
  readonly clock: WatchClock;
  readonly stdout: (value: string) => void;
  readonly stderr: (value: string) => void;
}
function realRuntime(): CliRuntime {
  return {
    reader: new GhGitHubReader(),
    clock: {
      now: () => performance.now() / 1_000,
      observedAt: () => new Date().toISOString(),
      sleep: async (seconds) => {
        await delay(seconds * 1_000);
      },
    },
    stdout: (value) => process.stdout.write(value),
    stderr: (value) => process.stderr.write(value),
  };
}
export async function main(
  argv: readonly string[],
  runtime: CliRuntime = realRuntime()
): Promise<number> {
  let options: CliOptions;
  try {
    options = parseArgs(argv, runtime);
  } catch (error) {
    if (!(error instanceof CliExit)) throw error;
    return error.exitCode;
  }
  const render = options.pretty ? renderPretty : renderJson;
  const emit = (verdict: T.ProgressVerdict): void =>
    runtime.stdout(render(verdict));
  let contexts: T.NonEmpty<T.PrContext>;
  try {
    const seed = await resolveContext({
      reader: runtime.reader,
      owner: options.owner,
      repo: options.repo,
      pr: options.pr ?? options.stackPrs[0] ?? null,
    });
    contexts =
      nonEmpty(options.stackPrs.map((number) => ({ ...seed, number }))) ??
      (options.mode === "single"
        ? [seed]
        : await discoverStack(runtime.reader, seed));
  } catch (error) {
    if (!(error instanceof WatcherQueryError)) throw error;
    const verdict = statusQueryVerdict(
      verdictFactory(runtime.clock, options.mode),
      1,
      error.failure
    );
    runtime.stdout(render(verdict));
    return verdict.exitCode;
  }
  const dependencies = { reader: runtime.reader, clock: runtime.clock, emit };
  const verdict =
    options.mode === "queued-stack" && !options.statusOnly
      ? await runQueued({ dependencies, contexts, options: options.polling })
      : await runSimple({
          dependencies,
          contexts,
          mode: options.mode,
          statusOnly: options.statusOnly,
          options: options.polling,
        });
  runtime.stdout(render(verdict));
  return verdict.exitCode;
}
