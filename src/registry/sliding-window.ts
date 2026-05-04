import {
  longestSubstringNoRepeat,
  maxSumSubarrayK,
} from "../problems/sliding-window/index.ts";
import { solution as maxSumSubarrayKSolution } from "../solutions/sliding-window/max-sum-subarray-k.ts";
import { referenceSolutions as maxSumSubarrayKReferences } from "../reference/sliding-window/max-sum-subarray-k.ts";
import { solution as longestSubstringNoRepeatSolution } from "../solutions/sliding-window/longest-substring-no-repeat.ts";
import { referenceSolutions as longestSubstringNoRepeatReferences } from "../reference/sliding-window/longest-substring-no-repeat.ts";

export const slidingWindowProblems = [
  {
    ...maxSumSubarrayK,
    solution: maxSumSubarrayKSolution,
    referenceSolutions: maxSumSubarrayKReferences,
  },
  {
    ...longestSubstringNoRepeat,
    solution: longestSubstringNoRepeatSolution,
    referenceSolutions: longestSubstringNoRepeatReferences,
  },
];
