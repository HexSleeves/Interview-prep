import type { Problem } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number;

export const solution = (_input: Input): Output => {
	// TODO: Implement your solution here
	// Given an array of integers nums and an integer k, return the total number
	// of subarrays whose sum equals to k.
	// A subarray is a contiguous non-empty sequence of elements within an array.
	throw new Error("Not implemented");
};

export const problem: Problem<Input, Output> = {
	id: "prefix-002",
	title: "Subarray Sum Equals K",
	description: `Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.

A subarray is a contiguous non-empty sequence of elements within an array.

Example 1:
  Input: nums = [1, 1, 1], k = 2
  Output: 2
  Explanation: [1, 1] appears twice as a subarray.

Example 2:
  Input: nums = [1, 2, 3], k = 3
  Output: 2
  Explanation: [1, 2] and [3] both sum to 3.

Constraints:
- 1 <= nums.length <= 2 * 10^4
- -1000 <= nums[i] <= 1000
- -10^7 <= k <= 10^7`,
	difficulty: "medium",
	tags: ["prefix-sum", "hash-map", "array"],
	hints: [
		"If we know the prefix sum at index j, and prefix sum at index i (where i < j), then sum of subarray [i+1, j] = prefixSum[j] - prefixSum[i].",
		"We want subarrays with sum = k, so we need prefixSum[j] - prefixSum[i] = k, which means prefixSum[i] = prefixSum[j] - k.",
		"Use a hash map to count how many times each prefix sum has occurred.",
	],
	testCases: [
		{
			input: { nums: [1, 1, 1], k: 2 },
			expected: 2,
			description: "Basic case with overlapping subarrays",
		},
		{
			input: { nums: [1, 2, 3], k: 3 },
			expected: 2,
			description: "Multiple distinct subarrays",
		},
		{
			input: { nums: [1, -1, 0], k: 0 },
			expected: 3,
			description: "Subarrays summing to zero",
		},
		{
			input: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 },
			expected: 4,
			description: "Larger array with multiple solutions",
		},
		{
			input: { nums: [1], k: 1 },
			expected: 1,
			description: "Single element equals k",
		},
		{
			input: { nums: [1], k: 0 },
			expected: 0,
			description: "Single element, no match",
		},
	],
	solution,
};
