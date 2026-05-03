type Input = { nums: number[]; queries: [number, number][] };
type Output = number[];

export const referenceSolution = (input: Input): Output => {
  const { nums, queries } = input;
  const prefixSum: number[] = [0];

  for (let i = 0; i < nums.length; i++) {
    prefixSum.push(prefixSum[i]! + nums[i]!);
  }

  return queries.map(([left, right]) => prefixSum[right + 1]! - prefixSum[left]!);
};
