/**
 * M0.3 acceptance: load companies from data file; print count and first company's signals.
 * Run from project root: npm run accept:m0.3
 */
import { loadCompanies } from "../src/load-companies";

const companies = loadCompanies();
console.log("Company count:", companies.length);
if (companies.length > 0) {
  console.log("First company:", JSON.stringify(companies[0], null, 2));
}
