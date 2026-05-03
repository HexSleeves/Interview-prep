type Input = { nums: number[]; k: number };
type Output = number;

export const referenceSolution = (input: Input): Output => {
  const { nums, k } = input;
  if (nums.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i]!;
  }

  let maxSum = windowSum;

  for (let i = k; i < nums.length; i++) {
    windowSum = windowSum + nums[i]! - nums[i - k]!;
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
};
