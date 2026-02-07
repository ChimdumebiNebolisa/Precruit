import express, { Request, Response } from "express";
import { loadCompanies } from "./load-companies";
import { computeFallbackProbability } from "./lib/fallback-formula";
import { getTrafficLight } from "./lib/traffic-light";
import type { CompanyApiItem } from "./types";

const FALLBACK_REASON =
  "Fallback scoring used due to invalid AI output.";

const app = express();
const port = process.env.PORT ?? 3000;

app.get("/api/companies", (_req: Request, res: Response) => {
  const companies = loadCompanies();
  const items: CompanyApiItem[] = companies.map((company) => {
    const probability = computeFallbackProbability(company);
    const { light, message } = getTrafficLight(probability);
    return {
      slug: company.slug,
      name: company.name,
      probability,
      traffic_light: light,
      neutral_explanation: message,
      ai_reason: FALLBACK_REASON,
    };
  });
  res.json(items);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
