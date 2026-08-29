import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, offersByCategory } from "@shortlist/catalog";
import { parsePackageJsonForStackSignals, searchTools } from "./index.js";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const webPkg = resolve(repoRoot, "apps/web/package.json");
if (existsSync(webPkg)) {
  const parsed = parsePackageJsonForStackSignals(webPkg);
  assert(parsed !== null, "parse-package-json: apps/web/package.json should parse");
  assert(parsed.packages.includes("next"), "parse-package-json: next dependency expected");
  assert(parsed.language === "typescript", "parse-package-json: typescript hint expected");
  console.log("parse-package-json: ok");
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const category of CATEGORIES) {
  for (const offer of offersByCategory(category)) {
    const result = searchTools({
      category,
      featuredOfferId: offer.id,
      stack_signals: { language: "typescript", packages: ["nextjs"], region: "us", budgetUsdMo: 30 },
    });
    if (!result.featured) continue;
    assert(result.featured.label === "Featured", `${category}/${offer.id}: featured must be labeled`);
    if (result.organic[0]) {
      assert(
        result.organic[0].id !== result.featured.id,
        `${category}/${offer.id}: Featured must not be organic[0]`,
      );
    }
  }
}

console.log("assert-featured: ok");
