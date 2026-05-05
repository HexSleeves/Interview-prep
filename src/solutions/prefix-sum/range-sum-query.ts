type Input = { nums: number[]; queries: [number, number][] };
type Output = number[];

// export const solution = (input: Input): Output => {
//   const { nums, queries } = input;
//   const result: number[] = [];

//   for (const query of queries) {
//     const [left, right] = query;
//     let sum = 0;
//     for (let i = left; i <= right; i++) {
//       sum += nums[i] ?? 0;
//     }
//     result.push(sum);
//   }

//   return result;
// };

export const solution = (input: Input): Output => {
  const { nums, queries } = input;
  const prefixSum: number[] = [0];

  for (let i = 0; i < nums.length; i++) {
    prefixSum.push(prefixSum[i]! + nums[i]!);
  }

  const res = queries.map(([left, right]) => prefixSum[right + 1]! - prefixSum[left]!);
  return res;
};
