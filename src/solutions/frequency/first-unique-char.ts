/**
 * Solution: First Unique Character in a String (freq-002)
 *
 * Approach: Two-pass with frequency map
 * Time Complexity: O(n) - two passes through the string
 * Space Complexity: O(1) - at most 26 lowercase letters
 */

type Input = { s: string };
type Output = number;

export const solution = (input: Input): Output => {
  const { s } = input;

  // Step 1: Count frequency of each character
  const freqMap = new Map<string, number>();
  for (const char of s) {
    freqMap.set(char, (freqMap.get(char) ?? 0) + 1);
  }

  // Step 2: Find first character with frequency 1
  for (let i = 0; i < s.length; i++) {
    if (freqMap.get(s[i]!) === 1) {
      return i;
    }
  }

  return -1;
};

/**
 * Key Insights:
 * 1. First pass: build frequency count
 * 2. Second pass: find first char with count = 1
 * 3. We need two passes because we need to know all frequencies
 *    before we can determine which is "unique"
 *
 * Why O(1) space?
 * - String consists of only lowercase English letters (26 max)
 * - Constant space regardless of input size
 *
 * Alternative: Could use array[26] instead of Map for slight
 * performance improvement (avoid hashing overhead)
 */
