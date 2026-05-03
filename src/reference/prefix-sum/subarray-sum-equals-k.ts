type Input = { nums: number[]; k: number };
type Output = number;

export const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  const prefixSumCount = new Map<number, number>();
  prefixSumCount.set(0, 1);

  let prefixSum = 0;
  let count = 0;

  for (const num of nums) {
    prefixSum += num;
    const complement = prefixSum - k;
    if (prefixSumCount.has(complement)) {
      count += prefixSumCount.get(complement)!;
    }
    prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) ?? 0) + 1);
  }

  return count;
};
