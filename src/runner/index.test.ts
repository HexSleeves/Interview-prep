import { describe, expect, test } from "bun:test";
import type { Problem, SolutionVariant } from "../types/problem.ts";
import {
  benchmarkProblem,
  benchmarkSuite,
  formatBenchmarkSuiteResult,
  formatProblemResult,
  formatSuiteResult,
  runProblem,
  runSuite,
} from "./index.ts";

const passingProblem: Problem<number, number> = {
  id: "sample-001",
  title: "Sample Problem",
  description: "Sample description",
  difficulty: "easy",
  tags: ["sample"],
  testCases: [
    { input: 2, expected: 4, description: "double two" },
    { input: 3, expected: 6, description: "double three" },
  ],
  solution: (input) => input * 2,
  referenceSolutions: [
    {
      id: "triple",
      title: "Triple",
      implementation: (input) => input * 3,
    },
  ],
};

describe("runProblem", () => {
  test("solution mode executes the editable solution", () => {
    const result = runProblem(passingProblem, { mode: "solution" });

    expect(result.mode).toBe("solution");
    expect(result.passed).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.total).toBe(2);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  test("reference mode executes the reference solution", () => {
    const result = runProblem(passingProblem, { mode: "reference" });

    expect(result.mode).toBe("reference");
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(2);
    expect(result.failures[0]).toMatchObject({
      testCase: 1,
      description: "double two",
      expected: 4,
      received: 6,
      solutionId: "triple",
    });
  });

  test("reference mode executes every reference solution variant", () => {
    const result = runProblem(
      {
        ...passingProblem,
        referenceSolutions: [
          {
            id: "double-a",
            title: "Double A",
            implementation: (input) => input * 2,
          },
          {
            id: "double-b",
            title: "Double B",
            implementation: (input) => input * 2,
          },
        ],
      },
      { mode: "reference" },
    );

    expect(result.solutionCount).toBe(2);
    expect(result.total).toBe(4);
    expect(result.passed).toBe(4);
    expect(result.failed).toBe(0);
  });

  test("reference mode can run one reference solution variant by id", () => {
    const result = runProblem(
      {
        ...passingProblem,
        referenceSolutions: [
          {
            id: "wrong",
            title: "Wrong",
            implementation: (input) => input * 3,
          },
          {
            id: "right",
            title: "Right",
            implementation: (input) => input * 2,
          },
        ],
      },
      { mode: "reference", solutionId: "right" },
    );

    expect(result.solutionCount).toBe(1);
    expect(result.total).toBe(2);
    expect(result.failed).toBe(0);
  });

  test("throws a helpful error for unknown reference solution ids", () => {
    expect(() => runProblem(passingProblem, { mode: "reference", solutionId: "missing" })).toThrow(
      'Unknown solution "missing" for sample-001. Available: triple',
    );
  });

  test("reports failed expected and received values", () => {
    const result = runProblem({
      ...passingProblem,
      solution: () => 99,
    });

    expect(result.failed).toBe(2);
    expect(result.failures[0]).toMatchObject({
      testCase: 1,
      description: "double two",
      expected: 4,
      received: 99,
    });
  });

  test("captures thrown errors as failures", () => {
    const result = runProblem({
      ...passingProblem,
      solution: () => {
        throw new Error("not implemented");
      },
    });

    expect(result.failed).toBe(2);
    expect(result.failures[0]).toMatchObject({
      testCase: 1,
      expected: 4,
      error: "not implemented",
    });
    expect(result.failures[0]?.received).toBeUndefined();
  });

  test("uses custom output comparison when provided", () => {
    const result = runProblem<number[], number[]>({
      id: "sample-002",
      title: "Orderless",
      description: "Orderless output",
      difficulty: "medium",
      tags: ["array"],
      testCases: [{ input: [1, 2, 3], expected: [1, 2, 3] }],
      solution: (input) => [...input].reverse(),
      referenceSolutions: [
        {
          id: "identity",
          title: "Identity",
          implementation: (input) => input,
        },
      ],
      compareOutput: (expected, received) =>
        expected.length === received.length &&
        [...expected]
          .sort((a, b) => a - b)
          .every((value, index) => value === [...received].sort((a, b) => a - b)[index]),
    });

    expect(result.failed).toBe(0);
    expect(result.passed).toBe(1);
  });

  test("reports comparator errors separately from solution errors", () => {
    const result = runProblem({
      ...passingProblem,
      compareOutput: () => {
        throw new Error("bad comparator");
      },
    });

    expect(result.failed).toBe(2);
    expect(result.failures[0]?.comparatorError).toBe("bad comparator");
    expect(result.failures[0]?.error).toBeUndefined();
  });
});

describe("runSuite", () => {
  test("aggregates passed and failed problem counts", () => {
    const result = runSuite([
      passingProblem,
      {
        ...passingProblem,
        id: "sample-002",
        solution: () => 0,
      },
    ]);

    expect(result.mode).toBe("solution");
    expect(result.totalProblems).toBe(2);
    expect(result.passedProblems).toBe(1);
    expect(result.failedProblems).toBe(1);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  test("passes solution filtering through to each problem", () => {
    const referenceSolutions: SolutionVariant<number, number>[] = [
      {
        id: "wrong",
        title: "Wrong",
        implementation: (input) => input * 3,
      },
      {
        id: "right",
        title: "Right",
        implementation: (input) => input * 2,
      },
    ];

    const result = runSuite(
      [
        { ...passingProblem, referenceSolutions },
        { ...passingProblem, id: "sample-002", referenceSolutions },
      ],
      { mode: "reference", solutionId: "right" },
    );

    expect(result.failedProblems).toBe(0);
    expect(result.results.every((problemResult) => problemResult.solutionCount === 1)).toBe(true);
  });
});

describe("benchmarks", () => {
  test("benchmarkProblem runs benchmark cases for reference solutions", () => {
    const result = benchmarkProblem(
      {
        ...passingProblem,
        benchmarkCases: [{ input: 2, iterations: 3, description: "small input" }],
        referenceSolutions: [
          {
            id: "double",
            title: "Double",
            implementation: (input) => input * 2,
          },
        ],
      },
      { solutionId: "double" },
    );

    expect(result.solutionCount).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      solutionId: "double",
      benchmarkCase: 1,
      iterations: 3,
      description: "small input",
    });
    expect(result.results[0]?.averageMs).toBeGreaterThanOrEqual(0);
  });

  test("benchmarkSuite formats benchmark output", () => {
    const output = formatBenchmarkSuiteResult(
      benchmarkSuite([{ ...passingProblem, benchmarkCases: [{ input: 2 }] }]),
    );

    expect(output).toContain("BENCHMARK");
    expect(output).toContain("sample-001");
    expect(output).toContain("BENCHMARK SUMMARY");
  });
});

describe("formatters", () => {
  test("formatProblemResult includes mode, totals, and failure details", () => {
    const output = formatProblemResult(runProblem({ ...passingProblem, solution: () => 0 }));

    expect(output).toContain("FAILED");
    expect(output).toContain("mode: solution");
    expect(output).toContain("Solutions: 1");
    expect(output).toContain("Tests: 0/2 passed");
    expect(output).toContain("Test #1 - double two");
    expect(output).toContain("Expected: 4");
    expect(output).toContain("Received: 0");
  });

  test("formatProblemResult formats undefined and circular values", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const output = formatProblemResult({
      problemId: "sample-003",
      title: "Formatting",
      mode: "solution",
      passed: 0,
      failed: 2,
      total: 2,
      solutionCount: 1,
      durationMs: 1,
      failures: [
        {
          solutionId: "learner",
          solutionTitle: "Learner Solution",
          testCase: 1,
          expected: undefined,
          received: undefined,
        },
        {
          solutionId: "learner",
          solutionTitle: "Learner Solution",
          testCase: 2,
          expected: circular,
          received: circular,
        },
      ],
    });

    expect(output).toContain("Expected: undefined");
    expect(output).toContain("[Circular]");
  });

  test("formatSuiteResult includes mode, totals, and failed problems", () => {
    const output = formatSuiteResult(runSuite([{ ...passingProblem, solution: () => 0 }]));

    expect(output).toContain("SUITE SUMMARY");
    expect(output).toContain("Mode: solution");
    expect(output).toContain("Problems: 0/1 passed");
    expect(output).toContain("Sample Problem (sample-001)");
  });
});
