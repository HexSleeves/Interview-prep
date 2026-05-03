import type { ProblemDefinition } from "../../types/problem.ts";

type Input = { s: string };
type Output = number;

export const problem: ProblemDefinition<Input, Output> = {
  id: "window-002",
  title: "Longest Substring Without Repeating Characters",
  description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
  Input: s = "abcabcbb"
  Output: 3
  Explanation: The answer is "abc", with the length of 3.

Example 2:
  Input: s = "bbbbb"
  Output: 1
  Explanation: The answer is "b", with the length of 1.

Example 3:
  Input: s = "pwwkew"
  Output: 3
  Explanation: The answer is "wke", with the length of 3.
  Notice that "pwke" is a subsequence, not a substring.

Constraints:
- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
  difficulty: "medium",
  tags: ["sliding-window", "hash-map", "string"],
  hints: [
    "Use a sliding window approach with two pointers.",
    "Use a hash map to store the most recent index of each character.",
    "When you find a repeating character, move the left pointer to one position after the previous occurrence.",
  ],
  testCases: [
    {
      input: { s: "abcabcbb" },
      expected: 3,
      description: "Basic case with repeating pattern",
    },
    {
      input: { s: "bbbbb" },
      expected: 1,
      description: "All same characters",
    },
    {
      input: { s: "pwwkew" },
      expected: 3,
      description: "Repeat in middle",
    },
    {
      input: { s: "" },
      expected: 0,
      description: "Empty string",
    },
    {
      input: { s: "a" },
      expected: 1,
      description: "Single character",
    },
    {
      input: { s: "abcdef" },
      expected: 6,
      description: "All unique characters",
    },
    {
      input: { s: "dvdf" },
      expected: 3,
      description: "Tricky case - 'vdf' is longest",
    },
  ],
};
