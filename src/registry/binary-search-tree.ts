import { validateBst, kthSmallest } from "../problems/binary-search-tree/index.ts";
import { solution as validateBstSolution } from "../solutions/binary-search-tree/validate-bst.ts";
import { referenceSolution as validateBstReference } from "../reference/binary-search-tree/validate-bst.ts";
import { solution as kthSmallestSolution } from "../solutions/binary-search-tree/kth-smallest.ts";
import { referenceSolution as kthSmallestReference } from "../reference/binary-search-tree/kth-smallest.ts";

export const bstProblems = [
  {
    ...validateBst,
    solution: validateBstSolution,
    referenceSolution: validateBstReference,
  },
  {
    ...kthSmallest,
    solution: kthSmallestSolution,
    referenceSolution: kthSmallestReference,
  },
];
