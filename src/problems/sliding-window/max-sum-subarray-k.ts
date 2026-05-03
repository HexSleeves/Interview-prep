import type { Problem } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number;

export const solution = (input: Input): Output => {
  // TODO: Implement your solution here
  // Given an array of integers nums and an integer k, find the maximum sum
  // of any contiguous subarray of size k.
  throw new Error("not implemented");
};

// Reference solution (hidden during practice)
const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  if (nums.length < k) return 0;

  // Calculate sum of first window
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i]!;
  }

  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < nums.length; i++) {
    windowSum = windowSum + nums[i]! - nums[i - k]!;
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
};

export const problem: Problem<Input, Output> = {
  id: "window-001",
  title: "Maximum Sum Subarray of Size K",
  description: `Given an array of integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.

Example 1:
  Input: nums = [2, 1, 5, 1, 3, 2], k = 3
  Output: 9
  Explanation: Subarray [5, 1, 3] has the maximum sum of 9.

Example 2:
  Input: nums = [2, 3, 4, 1, 5], k = 2
  Output: 7
  Explanation: Subarray [3, 4] or [2, 5] both have sum 7.

Constraints:
- 1 <= k <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
  difficulty: "easy",
  tags: ["sliding-window", "array"],
  hints: [
    "Use a sliding window of size k.",
    "Calculate the sum of the first k elements.",
    "Then slide the window: add the next element and remove the first element of the previous window.",
  ],
  testCases: [
    {
      input: { nums: [2, 1, 5, 1, 3, 2], k: 3 },
      expected: 9,
      description: "Basic case",
    },
    {
      input: { nums: [2, 3, 4, 1, 5], k: 2 },
      expected: 7,
      description: "Window size 2",
    },
    {
      input: { nums: [1, 2, 3, 4, 5], k: 5 },
      expected: 15,
      description: "Window equals array size",
    },
    {
      input: { nums: [-1, -2, -3, -4], k: 2 },
      expected: -3,
      description: "All negative numbers",
    },
    {
      input: { nums: [5], k: 1 },
      expected: 5,
      description: "Single element",
    },
    {
      input: { nums: [1, 4, 2, 10, 2, 3, 1, 0, 20], k: 4 },
      expected: 24,
      description: "Max sum at the end",
    },
  ],
  solution,
  referenceSolution,
};
