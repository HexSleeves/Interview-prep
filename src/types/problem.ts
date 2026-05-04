export interface TestCase<TInput, TOutput> {
  input: TInput;
  expected: TOutput;
  description?: string;
}

export type Solution<TInput, TOutput> = (input: TInput) => TOutput;

export interface SolutionVariant<TInput, TOutput> {
  id: string;
  title: string;
  description?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  implementation: Solution<TInput, TOutput>;
}

export type CompareOutput<TOutput, TInput = unknown> = (
  expected: TOutput,
  received: TOutput,
  testCase: TestCase<TInput, TOutput>,
) => boolean;

export interface ProblemDefinition<TInput, TOutput> {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: TestCase<TInput, TOutput>[];
  compareOutput?: CompareOutput<TOutput, TInput>;
  hints?: string[];
}

export interface Problem<TInput, TOutput> extends ProblemDefinition<TInput, TOutput> {
  solution: Solution<TInput, TOutput>;
  referenceSolutions: SolutionVariant<TInput, TOutput>[];
}

export type AnyProblemDefinition = ProblemDefinition<any, any>;
export type AnyProblem = Problem<any, any>;

export type RunMode = "solution" | "reference";

export interface RunProblemOptions {
  mode?: RunMode;
  solutionId?: string;
}

export interface TestFailure {
  solutionId: string;
  solutionTitle: string;
  testCase: number;
  description?: string;
  expected: unknown;
  received?: unknown;
  error?: string;
}

export interface ProblemResult {
  problemId: string;
  title: string;
  mode: RunMode;
  passed: number;
  failed: number;
  total: number;
  solutionCount: number;
  durationMs: number;
  failures: TestFailure[];
}

export interface SuiteResult {
  mode: RunMode;
  totalProblems: number;
  passedProblems: number;
  failedProblems: number;
  durationMs: number;
  results: ProblemResult[];
}
