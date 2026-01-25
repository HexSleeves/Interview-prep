/**
 * Solution: Range Sum Query - Immutable (prefix-001)
 *
 * Approach: Prefix sum array for O(1) range queries
 * Time Complexity: O(n) preprocessing, O(1) per query
 * Space Complexity: O(n) for prefix sum array
 */

type Input = { nums: number[]; queries: [number, number][] };
type Output = number[];

export const solution = (input: Input): Output => {
	const { nums, queries } = input;

	// Build prefix sum array
	// prefixSum[i] = sum of nums[0..i-1]
	// prefixSum[0] = 0 (sum of empty prefix)
	const prefixSum: number[] = [0];
	for (let i = 0; i < nums.length; i++) {
		const prevSum = prefixSum[i];
		const num = nums[i];
		if (prevSum !== undefined && num !== undefined) {
			prefixSum.push(prevSum + num);
		}
	}

	// Answer each query in O(1)
	// sum(left, right) = prefixSum[right + 1] - prefixSum[left]
	return queries.map(([left, right]) => {
		const rightSum = prefixSum[right + 1];
		const leftSum = prefixSum[left];
		if (rightSum !== undefined && leftSum !== undefined) {
			return rightSum - leftSum;
		}
		return 0;
	});
};

/**
 * Key Insights:
 * 1. Prefix sum allows O(1) range sum queries after O(n) preprocessing
 * 2. prefixSum[i] stores sum of elements from index 0 to i-1
 * 3. Range sum formula: sum(l, r) = prefix[r+1] - prefix[l]
 *
 * Visual Example:
 *   nums:      [-2,  0,  3, -5,  2, -1]
 *   prefixSum: [0, -2, -2,  1, -4, -2, -3]
 *              ^   ^   ^   ^   ^   ^   ^
 *              |   |   |   |   |   |   sum of all 6 elements
 *              |   |   |   |   |   sum of first 5 elements
 *              |   |   |   |   sum of first 4 elements
 *              |   |   |   sum of first 3 elements
 *              |   |   sum of first 2 elements
 *              |   sum of first 1 element
 *              sum of 0 elements (empty)
 *
 *   Query(0,2) = prefix[3] - prefix[0] = 1 - 0 = 1
 *   Query(2,5) = prefix[6] - prefix[2] = -3 - (-2) = -1
 */
