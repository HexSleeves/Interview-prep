import { rangeSumQuery, subarraySumEqualsK } from "../problems/prefix-sum/index.ts";
import { solution as rangeSumQuerySolution } from "../solutions/prefix-sum/range-sum-query.ts";
import { referenceSolutions as rangeSumQueryReferences } from "../reference/prefix-sum/range-sum-query.ts";
import { solution as subarraySumEqualsKSolution } from "../solutions/prefix-sum/subarray-sum-equals-k.ts";
import { referenceSolutions as subarraySumEqualsKReferences } from "../reference/prefix-sum/subarray-sum-equals-k.ts";

export const prefixSumProblems = [
  {
    ...rangeSumQuery,
    solution: rangeSumQuerySolution,
    referenceSolutions: rangeSumQueryReferences,
  },
  {
    ...subarraySumEqualsK,
    solution: subarraySumEqualsKSolution,
    referenceSolutions: subarraySumEqualsKReferences,
  },
];
