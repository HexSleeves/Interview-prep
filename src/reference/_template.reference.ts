import type { SolutionVariant } from "../types/problem.ts";

type Input = { values: number[] };
type Output = number;

export const referenceSolution = (input: Input): Output => {
  return input.values.reduce((sum, value) => sum + value, 0);
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "optimized",
    title: "Reference Approach",
    description: "Describe the approach without exposing source code in CLI output.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementation: referenceSolution,
  },
];
