/**
 * M1.3 acceptance: GET /api/companies response shape — array of CompanyApiItem,
 * each with probability 0–100, traffic_light in Green/Yellow/Orange/Red,
 * neutral_explanation and ai_reason strings.
 * Run from project root: npm run accept:m1.3
 */
import { getCompaniesForApi } from "../src/server";

const FALLBACK_REASON =
  "Fallback scoring used due to invalid AI output.";
const LIGHTS = ["Green", "Yellow", "Orange", "Red"];

const items = getCompaniesForApi();

if (!Array.isArray(items)) {
  console.error("FAIL: response must be an array");
  process.exit(1);
}

if (items.length === 0) {
  console.error("FAIL: expected at least one company");
  process.exit(1);
}

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (typeof item.slug !== "string" || typeof item.name !== "string") {
    console.error(`FAIL: item ${i} missing or invalid slug/name`);
    process.exit(1);
  }
  if (
    typeof item.probability !== "number" ||
    item.probability < 0 ||
    item.probability > 100
  ) {
    console.error(
      `FAIL: item ${i} (${item.slug}) probability must be 0–100, got ${item.probability}`
    );
    process.exit(1);
  }
  if (!LIGHTS.includes(item.traffic_light)) {
    console.error(
      `FAIL: item ${i} (${item.slug}) traffic_light must be one of ${LIGHTS.join(", ")}, got "${item.traffic_light}"`
    );
    process.exit(1);
  }
  if (typeof item.neutral_explanation !== "string" || !item.neutral_explanation) {
    console.error(`FAIL: item ${i} (${item.slug}) neutral_explanation must be non-empty string`);
    process.exit(1);
  }
  if (item.ai_reason !== FALLBACK_REASON) {
    console.error(
      `FAIL: item ${i} (${item.slug}) ai_reason must be the fixed fallback string, got "${item.ai_reason}"`
    );
    process.exit(1);
  }
}

console.log("M1.3 acceptance: passed");
