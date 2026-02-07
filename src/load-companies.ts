import * as path from "path";
import * as fs from "fs";
import type { CompanyInput } from "./types";

const DATA_PATH = path.join(__dirname, "..", "data", "companies.json");

export function loadCompanies(): CompanyInput[] {
  let raw: string;
  try {
    raw = fs.readFileSync(DATA_PATH, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read companies file at ${DATA_PATH}: ${message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON in ${DATA_PATH}: ${message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Companies file must be a JSON array: ${DATA_PATH}`);
  }
  return parsed as CompanyInput[];
}

if (require.main === module) {
  const companies = loadCompanies();
  console.log("Company count:", companies.length);
  if (companies.length > 0) {
    console.log("First company:", JSON.stringify(companies[0], null, 2));
  }
}
