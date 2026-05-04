import { validateBst, kthSmallest } from "../problems/binary-search-tree/index.ts";
import { solution as validateBstSolution } from "../solutions/binary-search-tree/validate-bst.ts";
import { referenceSolutions as validateBstReferences } from "../reference/binary-search-tree/validate-bst.ts";
import { solution as kthSmallestSolution } from "../solutions/binary-search-tree/kth-smallest.ts";
import { referenceSolutions as kthSmallestReferences } from "../reference/binary-search-tree/kth-smallest.ts";
import { composeProblem } from "./compose.ts";

export const bstProblems = [
  composeProblem(validateBst, validateBstSolution, validateBstReferences),
  composeProblem(kthSmallest, kthSmallestSolution, kthSmallestReferences),
];
