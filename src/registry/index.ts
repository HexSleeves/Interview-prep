import { bstProblems } from "./binary-search-tree.ts";
import { frequencyProblems } from "./frequency.ts";
import { prefixSumProblems } from "./prefix-sum.ts";
import { slidingWindowProblems } from "./sliding-window.ts";
import type { AnyProblem } from "../types/problem.ts";

export const allProblems: AnyProblem[] = [
  ...bstProblems,
  ...frequencyProblems,
  ...prefixSumProblems,
  ...slidingWindowProblems,
];

export const problemsByDomain: Record<Domain, AnyProblem[]> = {
  "binary-search-tree": bstProblems,
  frequency: frequencyProblems,
  "prefix-sum": prefixSumProblems,
  "sliding-window": slidingWindowProblems,
};

export type Domain = "binary-search-tree" | "frequency" | "prefix-sum" | "sliding-window";

export { bstProblems, frequencyProblems, prefixSumProblems, slidingWindowProblems };
