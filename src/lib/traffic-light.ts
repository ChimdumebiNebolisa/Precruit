/**
 * Derives traffic light and spec message from probability 0–100.
 * M1.1: thresholds and messages match precruit_spec.md exactly.
 */

export interface TrafficLightResult {
  light: string;
  message: string;
}

export function getTrafficLight(probability: number): TrafficLightResult {
  if (probability >= 60) {
    return {
      light: "Green",
      message:
        "This company shows strong hiring activity and may enter an internship window in the next 30 days.",
    };
  }
  if (probability >= 40) {
    return {
      light: "Yellow",
      message:
        "This company shows moderate hiring activity. An internship window is possible.",
    };
  }
  if (probability >= 20) {
    return {
      light: "Orange",
      message: "This company shows limited recent hiring activity.",
    };
  }
  return {
    light: "Red",
    message: "No significant hiring activity detected.",
  };
}
