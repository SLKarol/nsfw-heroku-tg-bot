import { CorrectImageDimension } from "../types/reddit";

export function isCorrectImageDimension(
  value: CorrectImageDimension | boolean
): value is CorrectImageDimension {
  const objectValues = Object.values(value);
  return (
    typeof value === "object" &&
    value !== null &&
    objectValues.length === 1 &&
    typeof objectValues[0] === "boolean"
  );
}
