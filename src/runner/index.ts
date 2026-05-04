import type {
  AnyProblem,
  Problem,
  ProblemResult,
  RunMode,
  RunProblemOptions,
  SolutionVariant,
  SuiteResult,
} from "../types/problem.ts";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

export function runProblem<TInput, TOutput>(
  problem: Problem<TInput, TOutput>,
  options: RunProblemOptions = {},
): ProblemResult {
  const mode = options.mode ?? "solution";
  const start = performance.now();
  const candidates = getCandidates(problem, mode, options.solutionId);
  const compareOutput = problem.compareOutput ?? deepEqual;
  const failures: ProblemResult["failures"] = [];
  let passed = 0;

  for (const candidate of candidates) {
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i]!;
      try {
        const result = candidate.implementation(testCase.input);
        if (compareOutput(testCase.expected, result, testCase)) {
          passed++;
        } else {
          failures.push({
            solutionId: candidate.id,
            solutionTitle: candidate.title,
            testCase: i + 1,
            description: testCase.description,
            expected: testCase.expected,
            received: result,
          });
        }
      } catch (error) {
        failures.push({
          solutionId: candidate.id,
          solutionTitle: candidate.title,
          testCase: i + 1,
          description: testCase.description,
          expected: testCase.expected,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return {
    problemId: problem.id,
    title: problem.title,
    mode,
    passed,
    failed: failures.length,
    total: problem.testCases.length * candidates.length,
    solutionCount: candidates.length,
    durationMs: performance.now() - start,
    failures,
  };
}

function getCandidates<TInput, TOutput>(
  problem: Problem<TInput, TOutput>,
  mode: RunMode,
  solutionId?: string,
): SolutionVariant<TInput, TOutput>[] {
  const candidates =
    mode === "solution"
      ? [
          {
            id: "learner",
            title: "Learner Solution",
            implementation: problem.solution,
          },
        ]
      : problem.referenceSolutions;

  if (!solutionId) return candidates;

  return candidates.filter((candidate) => candidate.id === solutionId);
}

export function runSuite(problems: AnyProblem[], options: RunProblemOptions = {}): SuiteResult {
  const mode: RunMode = options.mode ?? "solution";
  const start = performance.now();
  const results: ProblemResult[] = [];
  let passedProblems = 0;

  for (const problem of problems) {
    const result = runProblem(problem, { mode });
    results.push(result);
    if (result.failed === 0) {
      passedProblems++;
    }
  }

  return {
    mode,
    totalProblems: problems.length,
    passedProblems,
    failedProblems: problems.length - passedProblems,
    durationMs: performance.now() - start,
    results,
  };
}

export function formatProblemResult(result: ProblemResult): string {
  const status = result.failed === 0 ? "✓ PASSED" : "✗ FAILED";
  const lines: string[] = [
    `\n${"=".repeat(60)}`,
    `${status} | ${result.title} (${result.problemId}) | mode: ${result.mode}`,
    `${"=".repeat(60)}`,
    `Solutions: ${result.solutionCount}`,
    `Tests: ${result.passed}/${result.total} passed (${result.durationMs.toFixed(1)}ms)`,
  ];

  if (result.failures.length > 0) {
    lines.push("\nFailed test cases:");
    for (const failure of result.failures) {
      lines.push(`\n  Solution: ${failure.solutionTitle} (${failure.solutionId})`);
      lines.push(
        `\n  Test #${failure.testCase}${failure.description ? ` - ${failure.description}` : ""}`,
      );
      lines.push(`    Expected: ${JSON.stringify(failure.expected)}`);
      if (failure.error) {
        lines.push(`    Error: ${failure.error}`);
      } else {
        lines.push(`    Received: ${JSON.stringify(failure.received)}`);
      }
    }
  }

  return lines.join("\n");
}

export function formatSuiteResult(result: SuiteResult): string {
  const lines: string[] = [];

  for (const problemResult of result.results) {
    lines.push(formatProblemResult(problemResult));
  }

  lines.push(`\n${"=".repeat(60)}`);
  lines.push("SUITE SUMMARY");
  lines.push(`${"=".repeat(60)}`);
  lines.push(`Mode: ${result.mode}`);
  lines.push(`Problems: ${result.passedProblems}/${result.totalProblems} passed`);
  lines.push(`Duration: ${result.durationMs.toFixed(1)}ms`);

  if (result.failedProblems > 0) {
    lines.push("\nFailed problems:");
    for (const problemResult of result.results) {
      if (problemResult.failed > 0) {
        lines.push(`  - ${problemResult.title} (${problemResult.problemId})`);
      }
    }
  }

  return lines.join("\n");
}
