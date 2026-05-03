import { bstProblems } from "./binary-search-tree.ts";
import { frequencyProblems } from "./frequency.ts";
import { prefixSumProblems } from "./prefix-sum.ts";
import { slidingWindowProblems } from "./sliding-window.ts";

export const allProblems = [
  ...bstProblems,
  ...frequencyProblems,
  ...prefixSumProblems,
  ...slidingWindowProblems,
];

export const problemsByDomain = {
  "binary-search-tree": bstProblems,
  frequency: frequencyProblems,
  "prefix-sum": prefixSumProblems,
  "sliding-window": slidingWindowProblems,
};

export type Domain = keyof typeof problemsByDomain;

export { bstProblems, frequencyProblems, prefixSumProblems, slidingWindowProblems };
