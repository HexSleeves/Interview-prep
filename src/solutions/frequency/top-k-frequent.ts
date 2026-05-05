type Input = { nums: number[]; k: number };
type Output = number[];

export const solution = (input: Input): Output => {
  const { nums, k } = input;
  const freqMap = new Map<number, number>();

  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
  }

  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, freq] of freqMap) {
    buckets[freq]!.push(num);
  }

  const result: number[] = [];
  for (let i = buckets.length - 1; i > 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }

  return result;
};
