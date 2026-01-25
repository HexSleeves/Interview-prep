/**
 * Solution: Longest Substring Without Repeating Characters (window-002)
 *
 * Approach: Variable-size sliding window with hash map
 * Time Complexity: O(n) - each character visited at most twice
 * Space Complexity: O(min(m, n)) - m = charset size, n = string length
 */

type Input = { s: string };
type Output = number;

export const solution = (input: Input): Output => {
  const { s } = input;

  // Map: character -> most recent index where it appeared
  const charIndex = new Map<string, number>();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right]!;

    // If char was seen before AND is within current window
    if (charIndex.has(char) && charIndex.get(char)! >= left) {
      // Move left pointer past the previous occurrence
      left = charIndex.get(char)! + 1;
    }

    // Update character's most recent position
    charIndex.set(char, right);

    // Update max length
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
};

/**
 * Key Insights:
 * 1. Variable window: expand right, shrink left when duplicate found
 * 2. Track last seen index of each character
 * 3. Only shrink if duplicate is WITHIN current window (index >= left)
 *
 * Visual Example:
 *   s = "abcabcbb"
 *
 *   right=0: 'a', window="a",   maxLen=1, map={a:0}
 *   right=1: 'b', window="ab",  maxLen=2, map={a:0,b:1}
 *   right=2: 'c', window="abc", maxLen=3, map={a:0,b:1,c:2}
 *   right=3: 'a', duplicate! left=1, window="bca", map={a:3,b:1,c:2}
 *   right=4: 'b', duplicate! left=2, window="cab", map={a:3,b:4,c:2}
 *   right=5: 'c', duplicate! left=3, window="abc", map={a:3,b:4,c:5}
 *   right=6: 'b', duplicate! left=5, window="cb",  map={a:3,b:6,c:5}
 *   right=7: 'b', duplicate! left=7, window="b",   map={a:3,b:7,c:5}
 *
 *   Answer: 3 ("abc")
 *
 * Tricky case "dvdf":
 *   'd' at index 0, then 'd' at index 3 - but first 'd' is outside window!
 *   Must check: charIndex.get(char) >= left
 */
