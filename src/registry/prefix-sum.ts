import { rangeSumQuery, subarraySumEqualsK } from "../problems/prefix-sum/index.ts";
import { solution as rangeSumQuerySolution } from "../solutions/prefix-sum/range-sum-query.ts";
import { referenceSolution as rangeSumQueryReference } from "../reference/prefix-sum/range-sum-query.ts";
import { solution as subarraySumEqualsKSolution } from "../solutions/prefix-sum/subarray-sum-equals-k.ts";
import { referenceSolution as subarraySumEqualsKReference } from "../reference/prefix-sum/subarray-sum-equals-k.ts";

export const prefixSumProblems = [
  {
    ...rangeSumQuery,
    solution: rangeSumQuerySolution,
    referenceSolution: rangeSumQueryReference,
  },
  {
    ...subarraySumEqualsK,
    solution: subarraySumEqualsKSolution,
    referenceSolution: subarraySumEqualsKReference,
  },
];
