/**
 * M1.1 acceptance: 60->Green, 40->Yellow, 20->Orange, 19->Red; Green message includes "next 30 days".
 * Run from project root: npm run accept:m1.1
 */
import { getTrafficLight } from "../src/lib/traffic-light";

const cases: [number, string][] = [
  [60, "Green"],
  [40, "Yellow"],
  [20, "Orange"],
  [19, "Red"],
];

for (const [prob, expectedLight] of cases) {
  const result = getTrafficLight(prob);
  if (result.light !== expectedLight) {
    console.error(
      `FAIL: getTrafficLight(${prob}) expected light "${expectedLight}", got "${result.light}"`
    );
    process.exit(1);
  }
}

const greenMessage = getTrafficLight(60).message;
if (!greenMessage.includes("next 30 days")) {
  console.error(
    'FAIL: Green message must include "next 30 days", got:',
    greenMessage
  );
  process.exit(1);
}

console.log("M1.1 acceptance: passed");
