import type { Problem } from "../types/problem.ts";

type Input = { values: number[] };
type Output = number;

export const solution = (input: Input): Output => {
  // TODO: Implement your solution here.
  // Replace this sample prompt with the problem-specific instructions.
  throw new Error("not implemented");
};

const referenceSolution = (input: Input): Output => {
  return input.values.reduce((sum, value) => sum + value, 0);
};

const compareOutput = (expected: Output, received: Output): boolean => {
  return expected === received;
};

export const problem: Problem<Input, Output> = {
  id: "domain-000",
  title: "Problem Title",
  description: `Write the full problem prompt here.

Example:
  Input: values = [1, 2, 3]
  Output: 6`,
  difficulty: "easy",
  tags: ["domain"],
  hints: [
    "Add hints from broad to specific.",
    "Keep the last hint close to the intended approach.",
  ],
  testCases: [
    {
      input: { values: [1, 2, 3] },
      expected: 6,
      description: "basic case",
    },
  ],
  solution,
  referenceSolution,
  compareOutput,
};
