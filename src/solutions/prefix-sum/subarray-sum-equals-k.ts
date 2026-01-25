/**
 * Solution: Subarray Sum Equals K (prefix-002)
 *
 * Approach: Prefix sum with hash map for complement lookup
 * Time Complexity: O(n) - single pass through array
 * Space Complexity: O(n) - for storing prefix sum counts
 */

type Input = { nums: number[]; k: number };
type Output = number;

export const solution = (input: Input): Output => {
	const { nums, k } = input;

	// Map to count occurrences of each prefix sum
	const prefixSumCount = new Map<number, number>();
	// Empty prefix (sum = 0) occurs once before we start
	prefixSumCount.set(0, 1);

	let prefixSum = 0;
	let count = 0;

	for (const num of nums) {
		prefixSum += num;

		// If (prefixSum - k) exists, we found subarrays ending here with sum k
		// Because: currentPrefix - previousPrefix = k
		// Rearranged: previousPrefix = currentPrefix - k
		const complement = prefixSum - k;
		const complementCount = prefixSumCount.get(complement);
		if (complementCount !== undefined) {
			count += complementCount;
		}

		// Record this prefix sum
		prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) ?? 0) + 1);
	}

	return count;
};

/**
 * Key Insights:
 * 1. If prefixSum[j] - prefixSum[i] = k, then subarray (i,j] has sum k
 * 2. Rearranged: prefixSum[i] = prefixSum[j] - k
 * 3. For each position j, count how many previous prefixes equal (currentPrefix - k)
 * 4. Initialize with prefixSum=0 count=1 to handle subarrays starting at index 0
 *
 * Why this works:
 *   nums = [1, 1, 1], k = 2
 *
 *   i=0: prefix=1, complement=-1, not found, count=0, map={0:1, 1:1}
 *   i=1: prefix=2, complement=0,  found 1x!,  count=1, map={0:1, 1:1, 2:1}
 *   i=2: prefix=3, complement=1,  found 1x!,  count=2, map={0:1, 1:1, 2:1, 3:1}
 *
 *   Answer: 2 subarrays → [1,1] at indices (0,1) and (1,2)
 *
 * Common Mistake: Using sliding window - doesn't work with negative numbers!
 */
