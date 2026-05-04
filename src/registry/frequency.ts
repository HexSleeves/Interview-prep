import { firstUniqueChar, topKFrequent } from "../problems/frequency/index.ts";
import { solution as topKFrequentSolution } from "../solutions/frequency/top-k-frequent.ts";
import { referenceSolutions as topKFrequentReferences } from "../reference/frequency/top-k-frequent.ts";
import { solution as firstUniqueCharSolution } from "../solutions/frequency/first-unique-char.ts";
import { referenceSolutions as firstUniqueCharReferences } from "../reference/frequency/first-unique-char.ts";

export const frequencyProblems = [
  {
    ...topKFrequent,
    solution: topKFrequentSolution,
    referenceSolutions: topKFrequentReferences,
  },
  {
    ...firstUniqueChar,
    solution: firstUniqueCharSolution,
    referenceSolutions: firstUniqueCharReferences,
  },
];
