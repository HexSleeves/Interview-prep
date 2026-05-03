import { bstProblemDefinitions } from "./binary-search-tree/index.ts";
import { frequencyProblemDefinitions } from "./frequency/index.ts";
import { prefixSumProblemDefinitions } from "./prefix-sum/index.ts";
import { slidingWindowProblemDefinitions } from "./sliding-window/index.ts";

export const allProblemDefinitions = [
  ...bstProblemDefinitions,
  ...frequencyProblemDefinitions,
  ...prefixSumProblemDefinitions,
  ...slidingWindowProblemDefinitions,
];

export const problemDefinitionsByDomain = {
  "binary-search-tree": bstProblemDefinitions,
  frequency: frequencyProblemDefinitions,
  "prefix-sum": prefixSumProblemDefinitions,
  "sliding-window": slidingWindowProblemDefinitions,
};

export type Domain = keyof typeof problemDefinitionsByDomain;

export {
  bstProblemDefinitions,
  frequencyProblemDefinitions,
  prefixSumProblemDefinitions,
  slidingWindowProblemDefinitions,
};
