import type { SolutionVariant } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number[];

const bruteForceSolution = (input: Input): Output => {
  const unique = [...new Set(input.nums)];
  const counts = unique.map((num) => ({
    num,
    count: input.nums.filter((candidate) => candidate === num).length,
  }));

  return counts
    .sort((a, b) => b.count - a.count)
    .slice(0, input.k)
    .map(({ num }) => num)
    .sort((a, b) => a - b);
};

export const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  const freqMap = new Map<number, number>();

  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
  }

  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);

  for (const [num, freq] of freqMap) {
    buckets[freq]!.push(num);
  }

  const result: number[] = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]!);
  }

  return result.slice(0, k).sort((a, b) => a - b);
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Counting",
    description: "Count each unique number by scanning the input repeatedly.",
    timeComplexity: "O(u * n + u log u)",
    spaceComplexity: "O(u)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Frequency Map and Buckets",
    description: "Count once, group numbers by frequency, and collect from high to low.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    implementation: referenceSolution,
  },
];
