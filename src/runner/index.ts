import type {
  AnyProblem,
  BenchmarkProblemResult,
  BenchmarkSuiteResult,
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
        let matches = false;

        try {
          matches = compareOutput(testCase.expected, result, testCase);
        } catch (error) {
          failures.push({
            solutionId: candidate.id,
            solutionTitle: candidate.title,
            testCase: i + 1,
            description: testCase.description,
            input: testCase.input,
            expected: testCase.expected,
            received: result,
            comparatorError: error instanceof Error ? error.message : String(error),
          });
          continue;
        }

        if (matches) {
          passed++;
        } else {
          failures.push({
            solutionId: candidate.id,
            solutionTitle: candidate.title,
            testCase: i + 1,
            description: testCase.description,
            input: testCase.input,
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
          input: testCase.input,
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

  const filteredCandidates = candidates.filter((candidate) => candidate.id === solutionId);
  if (filteredCandidates.length === 0) {
    throw new Error(
      `Unknown solution "${solutionId}" for ${problem.id}. Available: ${candidates
        .map((candidate) => candidate.id)
        .join(", ")}`,
    );
  }

  return filteredCandidates;
}

export function runSuite(problems: AnyProblem[], options: RunProblemOptions = {}): SuiteResult {
  const mode: RunMode = options.mode ?? "solution";
  const start = performance.now();
  const results: ProblemResult[] = [];
  let passedProblems = 0;

  for (const problem of problems) {
    const result = runProblem(problem, { mode, solutionId: options.solutionId });
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

export function benchmarkProblem<TInput, TOutput>(
  problem: Problem<TInput, TOutput>,
  options: RunProblemOptions = {},
): BenchmarkProblemResult {
  const candidates = getCandidates(problem, "reference", options.solutionId);
  const benchmarkCases =
    problem.benchmarkCases ??
    problem.testCases.map((testCase) => ({
      input: testCase.input,
      description: testCase.description,
      iterations: 1,
    }));
  const results: BenchmarkProblemResult["results"] = [];

  for (const candidate of candidates) {
    for (let i = 0; i < benchmarkCases.length; i++) {
      const benchmarkCase = benchmarkCases[i]!;
      const iterations = benchmarkCase.iterations ?? 1;
      const start = performance.now();
      let error: string | undefined;

      try {
        for (let iteration = 0; iteration < iterations; iteration++) {
          candidate.implementation(benchmarkCase.input);
        }
      } catch (caughtError) {
        error = caughtError instanceof Error ? caughtError.message : String(caughtError);
      }

      const durationMs = performance.now() - start;
      results.push({
        solutionId: candidate.id,
        solutionTitle: candidate.title,
        benchmarkCase: i + 1,
        description: benchmarkCase.description,
        iterations,
        durationMs,
        averageMs: durationMs / iterations,
        error,
      });
    }
  }

  return {
    problemId: problem.id,
    title: problem.title,
    solutionCount: candidates.length,
    results,
  };
}

export function benchmarkSuite(problems: AnyProblem[], options: RunProblemOptions = {}): BenchmarkSuiteResult {
  return {
    totalProblems: problems.length,
    results: problems.map((problem) => benchmarkProblem(problem, options)),
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
      lines.push(`\n  Test #${failure.testCase}${failure.description ? ` - ${failure.description}` : ""}`);
      lines.push(`    Expected: ${formatValue(failure.expected)}`);
      if (failure.comparatorError) {
        lines.push(`    Comparator error: ${failure.comparatorError}`);
        lines.push(`    Received: ${formatValue(failure.received)}`);
      } else if (failure.error) {
        lines.push(`    Error: ${failure.error}`);
      } else {
        lines.push(`    Received: ${formatValue(failure.received)}`);
      }
    }
  }

  return lines.join("\n");
}

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);

  try {
    const seen = new WeakSet<object>();
    const formatted = JSON.stringify(value, (_key, nestedValue: unknown) => {
      if (typeof nestedValue === "object" && nestedValue !== null) {
        if (seen.has(nestedValue)) return "[Circular]";
        seen.add(nestedValue);
      }

      return nestedValue;
    });

    return formatted ?? String(value);
  } catch {
    return String(value);
  }
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

export function formatBenchmarkProblemResult(result: BenchmarkProblemResult): string {
  const lines = [
    `\n${"=".repeat(60)}`,
    `BENCHMARK | ${result.title} (${result.problemId})`,
    `${"=".repeat(60)}`,
    `Solutions: ${result.solutionCount}`,
  ];

  for (const benchmarkResult of result.results) {
    lines.push(
      `  ${benchmarkResult.solutionId.padEnd(12)} | case ${String(benchmarkResult.benchmarkCase).padEnd(2)} | ${benchmarkResult.averageMs.toFixed(4)}ms avg | ${benchmarkResult.iterations} iterations${benchmarkResult.description ? ` | ${benchmarkResult.description}` : ""}`,
    );
    if (benchmarkResult.error) {
      lines.push(`    Error: ${benchmarkResult.error}`);
    }
  }

  return lines.join("\n");
}

export function formatBenchmarkSuiteResult(result: BenchmarkSuiteResult): string {
  const lines = result.results.map(formatBenchmarkProblemResult);
  lines.push(`\n${"=".repeat(60)}`);
  lines.push("BENCHMARK SUMMARY");
  lines.push(`${"=".repeat(60)}`);
  lines.push(`Problems: ${result.totalProblems}`);
  return lines.join("\n");
}
