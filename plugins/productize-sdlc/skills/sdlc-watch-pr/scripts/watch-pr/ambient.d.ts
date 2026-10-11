declare module "bun:test" {
  export const describe: any;
  export const expect: any;
  export const it: any;
}

declare module "node:child_process" {
  export const spawn: any;
}

declare module "node:crypto" {
  export const createHash: any;
}

declare module "node:fs" {
  export const existsSync: any;
  export const readFileSync: any;
  export const writeFileSync: any;
}

declare module "node:path" {
  export const join: any;
}

declare module "node:timers/promises" {
  export const setTimeout: any;
}

interface ImportMeta {
  readonly dir: string;
  readonly main: boolean;
}

declare const Bun: any;
declare const process: any;
