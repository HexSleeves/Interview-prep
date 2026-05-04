import type { SolutionVariant } from "../../types/problem.ts";

type Input = { s: string };
type Output = number;

const bruteForceSolution = (input: Input): Output => {
  let best = 0;

  for (let start = 0; start < input.s.length; start++) {
    const seen = new Set<string>();
    for (let end = start; end < input.s.length; end++) {
      const char = input.s[end]!;
      if (seen.has(char)) break;
      seen.add(char);
      best = Math.max(best, end - start + 1);
    }
  }

  return best;
};

export const referenceSolution = (input: Input): Output => {
  const { s } = input;
  const charIndex = new Map<string, number>();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right]!;

    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      left = charIndex.get(char)! + 1;
    }

    charIndex.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Windows",
    description: "Start a window at every index and extend until a duplicate appears.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(k)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Sliding Window",
    description: "Track last-seen indexes and move the left edge past duplicates.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)",
    implementation: referenceSolution,
  },
];
