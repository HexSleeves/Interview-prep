/**
 * Solution: Top K Frequent Elements (freq-001)
 *
 * Approach: Bucket sort by frequency
 * Time Complexity: O(n) - single pass to count, single pass to collect
 * Space Complexity: O(n) - for frequency map and buckets
 */

type Input = { nums: number[]; k: number };
type Output = number[];

export const solution = (input: Input): Output => {
	const { nums, k } = input;

	// Step 1: Count frequency of each number
	const freqMap = new Map<number, number>();
	for (const num of nums) {
		freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
	}

	// Step 2: Create buckets where index = frequency
	// Maximum frequency possible is nums.length
	const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);

	for (const [num, freq] of freqMap) {
		const bucket = buckets[freq];
		if (bucket) {
			bucket.push(num);
		}
	}

	// Step 3: Collect k most frequent elements from highest frequency buckets
	const result: number[] = [];
	for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
		const bucket = buckets[i];
		if (bucket) {
			result.push(...bucket);
		}
	}

	return result.slice(0, k).sort((a, b) => a - b);
};

/**
 * Key Insights:
 * 1. Bucket sort achieves O(n) by using frequency as index
 * 2. Maximum possible frequency equals array length
 * 3. Iterate buckets from highest to lowest frequency
 *
 * Alternative Approaches:
 * - Min-heap of size k: O(n log k) time
 * - Sort by frequency: O(n log n) time
 * - Quickselect: O(n) average, O(n²) worst case
 *
 * The bucket sort approach is optimal for this problem.
 */
