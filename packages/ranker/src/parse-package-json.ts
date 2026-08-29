import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ParsedPackageJsonSignals = {
  language?: string;
  packages: string[];
};

type PackageJsonShape = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function inferLanguage(deps: Record<string, string>): string | undefined {
  if (deps.typescript || deps["@types/node"] || deps["@types/react"]) return "typescript";
  if (deps.next || deps["@next/eslint-plugin-next"]) return "typescript";
  if (deps.react || deps.vue || deps.svelte) return "javascript";
  if (deps.python || deps.django || deps.flask) return "python";
  if (deps.go || deps.gin) return "go";
  if (deps.rust || deps["@napi-rs/cli"]) return "rust";
  return undefined;
}

function dependencyNames(pkg: PackageJsonShape): string[] {
  const names = new Set<string>();
  for (const key of Object.keys(pkg.dependencies ?? {})) names.add(key);
  for (const key of Object.keys(pkg.devDependencies ?? {})) names.add(key);
  return [...names].sort();
}

/**
 * Read a package.json and extract deterministic stack_signals hints.
 * Returns null when the file is missing or unreadable.
 */
export function parsePackageJsonForStackSignals(
  packageJsonPath: string,
): ParsedPackageJsonSignals | null {
  const resolved = resolve(packageJsonPath);
  if (!existsSync(resolved)) return null;

  try {
    const raw = readFileSync(resolved, "utf-8");
    const pkg = JSON.parse(raw) as PackageJsonShape;
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    const packages = dependencyNames(pkg);
    const language = inferLanguage(deps);
    return language ? { language, packages } : { packages };
  } catch {
    return null;
  }
}

/** Resolve package.json under cwd (default) or an explicit directory. */
export function resolvePackageJsonPath(cwdOrPath?: string): string {
  const base = cwdOrPath ? resolve(cwdOrPath) : process.cwd();
  const asFile = base.endsWith("package.json") ? base : resolve(base, "package.json");
  return asFile;
}

/**
 * Merge explicit stack_signals with package.json hints.
 * Reads package.json only when packages are omitted and a path is available.
 */
export function mergeStackSignalsFromPackageJson(input: {
  stack_signals?: { language?: string; packages?: string[]; region?: string; budgetUsdMo?: number };
  package_json_path?: string;
}): {
  language?: string;
  packages?: string[];
  region?: string;
  budgetUsdMo?: number;
} {
  const base = input.stack_signals ?? {};
  if (base.packages?.length) return base;

  const pkgPath = resolvePackageJsonPath(input.package_json_path ?? process.cwd());
  const parsed = parsePackageJsonForStackSignals(pkgPath);
  if (!parsed) return base;

  return {
    ...base,
    language: base.language ?? parsed.language,
    packages: parsed.packages,
  };
}
