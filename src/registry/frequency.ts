import { firstUniqueChar, topKFrequent } from "../problems/frequency/index.ts";
import { solution as topKFrequentSolution } from "../solutions/frequency/top-k-frequent.ts";
import { referenceSolution as topKFrequentReference } from "../reference/frequency/top-k-frequent.ts";
import { solution as firstUniqueCharSolution } from "../solutions/frequency/first-unique-char.ts";
import { referenceSolution as firstUniqueCharReference } from "../reference/frequency/first-unique-char.ts";

export const frequencyProblems = [
  {
    ...topKFrequent,
    solution: topKFrequentSolution,
    referenceSolution: topKFrequentReference,
  },
  {
    ...firstUniqueChar,
    solution: firstUniqueCharSolution,
    referenceSolution: firstUniqueCharReference,
  },
];
