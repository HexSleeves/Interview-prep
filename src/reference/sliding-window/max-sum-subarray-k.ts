import type { SolutionVariant } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number;

const bruteForceSolution = (input: Input): Output => {
  if (input.nums.length < input.k) return 0;
  let best = -Infinity;

  for (let start = 0; start <= input.nums.length - input.k; start++) {
    let sum = 0;
    for (let i = start; i < start + input.k; i++) {
      sum += input.nums[i]!;
    }
    best = Math.max(best, sum);
  }

  return best;
};

export const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  if (nums.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i]!;
  }

  let maxSum = windowSum;

  for (let i = k; i < nums.length; i++) {
    windowSum = windowSum + nums[i]! - nums[i - k]!;
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Windows",
    description: "Compute the sum of every window independently.",
    timeComplexity: "O(n * k)",
    spaceComplexity: "O(1)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Sliding Window",
    description: "Reuse the previous window sum by subtracting one value and adding one value.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementation: referenceSolution,
  },
];
