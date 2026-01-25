import { bstProblems } from "./binary-search-tree/index.ts";
import { frequencyProblems } from "./frequency/index.ts";
import { prefixSumProblems } from "./prefix-sum/index.ts";
import { slidingWindowProblems } from "./sliding-window/index.ts";

export const allProblems = [
	...bstProblems,
	...frequencyProblems,
	...prefixSumProblems,
	...slidingWindowProblems,
];

export const problemsByDomain = {
	"binary-search-tree": bstProblems,
	frequency: frequencyProblems,
	"prefix-sum": prefixSumProblems,
	"sliding-window": slidingWindowProblems,
};

export type Domain = keyof typeof problemsByDomain;

export {
	bstProblems,
	frequencyProblems,
	prefixSumProblems,
	slidingWindowProblems,
};
