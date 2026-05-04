import type { SolutionVariant } from "../../types/problem.ts";

type Input = { s: string };
type Output = number;

const bruteForceSolution = (input: Input): Output => {
  const { s } = input;

  for (let i = 0; i < s.length; i++) {
    let count = 0;
    for (let j = 0; j < s.length; j++) {
      if (s[i] === s[j]) count++;
    }
    if (count === 1) return i;
  }

  return -1;
};

export const referenceSolution = (input: Input): Output => {
  const { s } = input;
  const freqMap = new Map<string, number>();

  for (const char of s) {
    freqMap.set(char, (freqMap.get(char) ?? 0) + 1);
  }

  for (let i = 0; i < s.length; i++) {
    if (freqMap.get(s[i]!) === 1) {
      return i;
    }
  }

  return -1;
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Scan",
    description: "For each character, scan the full string to count occurrences.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Frequency Map",
    description: "Count characters once, then scan for the first count of one.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementation: referenceSolution,
  },
];
