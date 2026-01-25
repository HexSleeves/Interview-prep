/**
 * Solution: Maximum Sum Subarray of Size K (window-001)
 *
 * Approach: Fixed-size sliding window
 * Time Complexity: O(n) - single pass through array
 * Space Complexity: O(1) - only tracking current sum
 */

type Input = { nums: number[]; k: number };
type Output = number;

export const solution = (input: Input): Output => {
	const { nums, k } = input;
	if (nums.length < k) return 0;

	// Calculate sum of first window
	let windowSum = 0;
	for (let i = 0; i < k; i++) {
		const num = nums[i];
		if (num !== undefined) {
			windowSum += num;
		}
	}

	let maxSum = windowSum;

	// Slide the window: add next element, remove first element
	for (let i = k; i < nums.length; i++) {
		const addNum = nums[i];
		const removeNum = nums[i - k];
		if (addNum !== undefined && removeNum !== undefined) {
			windowSum = windowSum + addNum - removeNum;
			maxSum = Math.max(maxSum, windowSum);
		}
	}

	return maxSum;
};

/**
 * Key Insights:
 * 1. Fixed window size = classic sliding window pattern
 * 2. Instead of recalculating sum each time (O(k)), maintain running sum
 * 3. Slide: add incoming element, subtract outgoing element
 *
 * Visual Example:
 *   nums = [2, 1, 5, 1, 3, 2], k = 3
 *
 *   Window 1: [2, 1, 5] = 8
 *   Window 2: [1, 5, 1] = 7  (8 + 1 - 2)
 *   Window 3: [5, 1, 3] = 9  (7 + 3 - 1) ← maximum
 *   Window 4: [1, 3, 2] = 6  (9 + 2 - 5)
 *
 *   Answer: 9
 *
 * This is the fundamental sliding window technique that forms
 * the basis for more complex variable-size window problems.
 */
