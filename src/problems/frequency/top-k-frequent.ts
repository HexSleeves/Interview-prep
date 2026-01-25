import type { Problem } from "../../types/problem.ts";

type Input = { nums: number[]; k: number };
type Output = number[];

export const solution = (_input: Input): Output => {
	// TODO: Implement your solution here
	// Given an integer array nums and an integer k, return the k most frequent elements.
	// You may return the answer in any order.
	throw new Error("Not implemented");
};

export const problem: Problem<Input, Output> = {
	id: "freq-001",
	title: "Top K Frequent Elements",
	description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.

Example 1:
  Input: nums = [1,1,1,2,2,3], k = 2
  Output: [1,2]

Example 2:
  Input: nums = [1], k = 1
  Output: [1]

Constraints:
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4
- k is in the range [1, the number of unique elements in the array].
- It is guaranteed that the answer is unique.

Follow up: Your algorithm's time complexity must be better than O(n log n).`,
	difficulty: "medium",
	tags: ["frequency", "hash-map", "bucket-sort", "heap"],
	hints: [
		"Use a hash map to count the frequency of each element.",
		"Consider using bucket sort where the index represents frequency.",
		"Alternatively, you could use a min-heap of size k.",
	],
	testCases: [
		{
			input: { nums: [1, 1, 1, 2, 2, 3], k: 2 },
			expected: [1, 2],
			description: "Basic case with clear frequency differences",
		},
		{
			input: { nums: [1], k: 1 },
			expected: [1],
			description: "Single element array",
		},
		{
			input: { nums: [4, 1, -1, 2, -1, 2, 3], k: 2 },
			expected: [-1, 2],
			description: "Array with negative numbers",
		},
		{
			input: { nums: [1, 2, 3, 4, 5], k: 5 },
			expected: [1, 2, 3, 4, 5],
			description: "All elements have same frequency",
		},
		{
			input: { nums: [5, 5, 5, 5, 1, 1, 1, 2, 2, 3], k: 3 },
			expected: [1, 2, 5],
			description: "Return top 3 frequent",
		},
	],
	solution,
};
