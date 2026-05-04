type Input = { nums: number[]; k: number };
type Output = number[];

export const solution = (input: Input): Output => {
  const { nums, k } = input;
  const freqMap = new Map<number, number>();

  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
  }

  const buckets = [];
  throw new Error("not implemented");
};
