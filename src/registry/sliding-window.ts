import {
  longestSubstringNoRepeat,
  maxSumSubarrayK,
} from "../problems/sliding-window/index.ts";
import { solution as maxSumSubarrayKSolution } from "../solutions/sliding-window/max-sum-subarray-k.ts";
import { referenceSolution as maxSumSubarrayKReference } from "../reference/sliding-window/max-sum-subarray-k.ts";
import { solution as longestSubstringNoRepeatSolution } from "../solutions/sliding-window/longest-substring-no-repeat.ts";
import { referenceSolution as longestSubstringNoRepeatReference } from "../reference/sliding-window/longest-substring-no-repeat.ts";

export const slidingWindowProblems = [
  {
    ...maxSumSubarrayK,
    solution: maxSumSubarrayKSolution,
    referenceSolution: maxSumSubarrayKReference,
  },
  {
    ...longestSubstringNoRepeat,
    solution: longestSubstringNoRepeatSolution,
    referenceSolution: longestSubstringNoRepeatReference,
  },
];
