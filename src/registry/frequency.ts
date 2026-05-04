import { firstUniqueChar, topKFrequent } from "../problems/frequency/index.ts";
import { solution as topKFrequentSolution } from "../solutions/frequency/top-k-frequent.ts";
import { referenceSolutions as topKFrequentReferences } from "../reference/frequency/top-k-frequent.ts";
import { solution as firstUniqueCharSolution } from "../solutions/frequency/first-unique-char.ts";
import { referenceSolutions as firstUniqueCharReferences } from "../reference/frequency/first-unique-char.ts";
import { composeProblem } from "./compose.ts";

export const frequencyProblems = [
  composeProblem(topKFrequent, topKFrequentSolution, topKFrequentReferences),
  composeProblem(firstUniqueChar, firstUniqueCharSolution, firstUniqueCharReferences),
];
