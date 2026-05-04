import type { SolutionVariant } from "../../types/problem.ts";

type Input = { nums: number[]; queries: [number, number][] };
type Output = number[];

const bruteForceSolution = (input: Input): Output => {
  return input.queries.map(([left, right]) => {
    let sum = 0;
    for (let i = left; i <= right; i++) {
      sum += input.nums[i]!;
    }
    return sum;
  });
};

export const referenceSolution = (input: Input): Output => {
  const { nums, queries } = input;
  const prefixSum: number[] = [0];

  for (let i = 0; i < nums.length; i++) {
    prefixSum.push(prefixSum[i]! + nums[i]!);
  }

  return queries.map(([left, right]) => prefixSum[right + 1]! - prefixSum[left]!);
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Brute Force Per Query",
    description: "Sum each requested range directly.",
    timeComplexity: "O(q * n)",
    spaceComplexity: "O(1)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Prefix Sum",
    description: "Precompute prefix sums and answer each range in constant time.",
    timeComplexity: "O(n + q)",
    spaceComplexity: "O(n)",
    implementation: referenceSolution,
  },
];
