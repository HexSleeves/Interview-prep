export interface TestCase<TInput, TOutput> {
  input: TInput;
  expected: TOutput;
  description?: string;
}

export interface BenchmarkCase<TInput> {
  input: TInput;
  description?: string;
  iterations?: number;
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
  benchmarkCases?: BenchmarkCase<TInput>[];
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
  input?: unknown;
  expected: unknown;
  received?: unknown;
  error?: string;
  comparatorError?: string;
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

export interface BenchmarkSolutionResult {
  solutionId: string;
  solutionTitle: string;
  benchmarkCase: number;
  description?: string;
  iterations: number;
  durationMs: number;
  averageMs: number;
  error?: string;
}

export interface BenchmarkProblemResult {
  problemId: string;
  title: string;
  solutionCount: number;
  results: BenchmarkSolutionResult[];
}

export interface BenchmarkSuiteResult {
  totalProblems: number;
  results: BenchmarkProblemResult[];
}
