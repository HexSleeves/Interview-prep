export interface TestCase<TInput, TOutput> {
  input: TInput;
  expected: TOutput;
  description?: string;
}

export interface Problem<TInput, TOutput> {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: TestCase<TInput, TOutput>[];
  solution: (input: TInput) => TOutput;
  hints?: string[];
}

export interface ProblemResult {
  problemId: string;
  title: string;
  passed: number;
  failed: number;
  total: number;
  failures: {
    testCase: number;
    description?: string;
    expected: unknown;
    received: unknown;
  }[];
}

export interface SuiteResult {
  totalProblems: number;
  passedProblems: number;
  failedProblems: number;
  results: ProblemResult[];
}
