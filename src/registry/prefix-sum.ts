import { rangeSumQuery, subarraySumEqualsK } from "../problems/prefix-sum/index.ts";
import { solution as rangeSumQuerySolution } from "../solutions/prefix-sum/range-sum-query.ts";
import { referenceSolutions as rangeSumQueryReferences } from "../reference/prefix-sum/range-sum-query.ts";
import { solution as subarraySumEqualsKSolution } from "../solutions/prefix-sum/subarray-sum-equals-k.ts";
import { referenceSolutions as subarraySumEqualsKReferences } from "../reference/prefix-sum/subarray-sum-equals-k.ts";
import { composeProblem } from "./compose.ts";

export const prefixSumProblems = [
  composeProblem(rangeSumQuery, rangeSumQuerySolution, rangeSumQueryReferences),
  composeProblem(subarraySumEqualsK, subarraySumEqualsKSolution, subarraySumEqualsKReferences),
];
