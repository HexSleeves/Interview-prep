import type { Problem, ProblemDefinition, Solution, SolutionVariant } from "../types/problem.ts";

export function composeProblem<TInput, TOutput>(
  definition: ProblemDefinition<TInput, TOutput>,
  solution: Solution<TInput, TOutput>,
  referenceSolutions: SolutionVariant<TInput, TOutput>[],
): Problem<TInput, TOutput> {
  return {
    ...definition,
    solution,
    referenceSolutions,
  };
}
