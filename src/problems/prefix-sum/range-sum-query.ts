import type { Problem } from "../../types/problem.ts";

type Input = { nums: number[]; queries: [number, number][] };
type Output = number[];

export const solution = (input: Input): Output => {
  // TODO: Implement your solution here
  // Given an integer array nums, handle multiple queries of the form:
  // Calculate the sum of elements between indices left and right inclusive.
  // Use prefix sum for O(1) query time after O(n) preprocessing.
  throw new Error("Not implemented");
};

// Reference solution (hidden during practice)
const referenceSolution = (input: Input): Output => {
  const { nums, queries } = input;

  // Build prefix sum array
  const prefixSum: number[] = [0];
  for (let i = 0; i < nums.length; i++) {
    prefixSum.push(prefixSum[i]! + nums[i]!);
  }

  // Answer queries in O(1) each
  return queries.map(([left, right]) => {
    return prefixSum[right + 1]! - prefixSum[left]!;
  });
};

export const problem: Problem<Input, Output> = {
  id: "prefix-001",
  title: "Range Sum Query - Immutable",
  description: `Given an integer array nums, handle multiple queries of the following type:
- Calculate the sum of the elements of nums between indices left and right inclusive where left <= right.

Implement the solution using prefix sums for efficient query answering.

Example 1:
  Input: nums = [-2, 0, 3, -5, 2, -1], queries = [[0, 2], [2, 5], [0, 5]]
  Output: [1, -1, -3]
  Explanation:
    sumRange(0, 2) -> (-2) + 0 + 3 = 1
    sumRange(2, 5) -> 3 + (-5) + 2 + (-1) = -1
    sumRange(0, 5) -> (-2) + 0 + 3 + (-5) + 2 + (-1) = -3

Constraints:
- 1 <= nums.length <= 10^4
- -10^5 <= nums[i] <= 10^5
- 0 <= left <= right < nums.length
- At most 10^4 calls will be made to sumRange.`,
  difficulty: "easy",
  tags: ["prefix-sum", "array", "design"],
  hints: [
    "Build a prefix sum array where prefixSum[i] = sum of nums[0..i-1].",
    "The sum of range [left, right] = prefixSum[right + 1] - prefixSum[left].",
    "This allows O(n) preprocessing and O(1) per query.",
  ],
  testCases: [
    {
      input: {
        nums: [-2, 0, 3, -5, 2, -1],
        queries: [
          [0, 2],
          [2, 5],
          [0, 5],
        ],
      },
      expected: [1, -1, -3],
      description: "Basic example with multiple queries",
    },
    {
      input: {
        nums: [1, 2, 3, 4, 5],
        queries: [
          [0, 4],
          [1, 3],
          [2, 2],
        ],
      },
      expected: [15, 9, 3],
      description: "Positive numbers only",
    },
    {
      input: {
        nums: [5],
        queries: [[0, 0]],
      },
      expected: [5],
      description: "Single element array",
    },
    {
      input: {
        nums: [1, 1, 1, 1, 1],
        queries: [
          [0, 0],
          [0, 4],
          [2, 3],
        ],
      },
      expected: [1, 5, 2],
      description: "All same values",
    },
  ],
  solution: referenceSolution,
};
