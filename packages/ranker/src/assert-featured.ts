import { CATEGORIES, offersByCategory } from "@shortlist/catalog";
import { searchTools } from "./index.js";

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
