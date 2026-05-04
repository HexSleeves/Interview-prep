import type { SolutionVariant } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number;

const bruteForceSolution = (input: Input): Output => {
  let count = 0;

  for (let start = 0; start < input.nums.length; start++) {
    let sum = 0;
    for (let end = start; end < input.nums.length; end++) {
      sum += input.nums[end]!;
      if (sum === input.k) count++;
    }
  }

  return count;
};

export const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  const prefixSumCount = new Map<number, number>();
  prefixSumCount.set(0, 1);

  let prefixSum = 0;
  let count = 0;

  for (const num of nums) {
    prefixSum += num;
    const complement = prefixSum - k;
    if (prefixSumCount.has(complement)) {
      count += prefixSumCount.get(complement)!;
    }
    prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) ?? 0) + 1);
  }

  return count;
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Subarrays",
    description: "Try every subarray and count sums equal to k.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Prefix Sum Counts",
    description: "Track prior prefix sums and count complements.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    implementation: referenceSolution,
  },
];
