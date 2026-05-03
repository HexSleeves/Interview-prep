import type { ProblemDefinition } from "../types/problem.ts";

type Input = { values: number[] };
type Output = number;

const compareOutput = (expected: Output, received: Output): boolean => {
  return expected === received;
};

export const problem: ProblemDefinition<Input, Output> = {
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
  compareOutput,
};
