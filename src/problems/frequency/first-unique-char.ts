import type { Problem } from "../../types/problem.ts";

type Input = { s: string };
type Output = number;

export const solution = (_input: Input): Output => {
	// TODO: Implement your solution here
	// Given a string s, find the first non-repeating character and return its index.
	// If it does not exist, return -1.
	throw new Error("Not implemented");
};

export const problem: Problem<Input, Output> = {
	id: "freq-002",
	title: "First Unique Character in a String",
	description: `Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.

Example 1:
  Input: s = "leetcode"
  Output: 0
  Explanation: The character 'l' at index 0 is the first non-repeating character.

Example 2:
  Input: s = "loveleetcode"
  Output: 2
  Explanation: The character 'v' at index 2 is the first non-repeating character.

Example 3:
  Input: s = "aabb"
  Output: -1
  Explanation: There is no non-repeating character.

Constraints:
- 1 <= s.length <= 10^5
- s consists of only lowercase English letters.`,
	difficulty: "easy",
	tags: ["frequency", "hash-map", "string"],
	hints: [
		"Use a hash map to count the frequency of each character.",
		"Then iterate through the string again to find the first character with frequency 1.",
		"This gives you O(n) time complexity.",
	],
	testCases: [
		{
			input: { s: "leetcode" },
			expected: 0,
			description: "First character is unique",
		},
		{
			input: { s: "loveleetcode" },
			expected: 2,
			description: "Unique character in middle",
		},
		{
			input: { s: "aabb" },
			expected: -1,
			description: "No unique character",
		},
		{
			input: { s: "a" },
			expected: 0,
			description: "Single character string",
		},
		{
			input: { s: "aabbccd" },
			expected: 6,
			description: "Unique character at end",
		},
		{
			input: { s: "abcabc" },
			expected: -1,
			description: "All characters appear twice",
		},
	],
	solution,
};
