export interface TestCase<TInput, TOutput> {
  input: TInput;
  expected: TOutput;
  description?: string;
}

export type Solution<TInput, TOutput> = (input: TInput) => TOutput;

export type CompareOutput<TOutput, TInput = unknown> = (
  expected: TOutput,
  received: TOutput,
  testCase: TestCase<TInput, TOutput>
) => boolean;

export interface Problem<TInput, TOutput> {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: TestCase<TInput, TOutput>[];
  solution: Solution<TInput, TOutput>;
  referenceSolution: Solution<TInput, TOutput>;
  compareOutput?: CompareOutput<TOutput, TInput>;
  hints?: string[];
}

export type AnyProblem = Problem<any, any>;

export type RunMode = "solution" | "reference";

export interface RunProblemOptions {
  mode?: RunMode;
}

export interface TestFailure {
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
