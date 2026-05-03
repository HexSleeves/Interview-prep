import { describe, expect, test } from "bun:test";
import type { Problem } from "../types/problem.ts";
import {
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
  referenceSolution: (input) => input * 3,
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
    });
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
      referenceSolution: (input) => input,
      compareOutput: (expected, received) =>
        expected.length === received.length &&
        [...expected]
          .sort((a, b) => a - b)
          .every((value, index) => value === [...received].sort((a, b) => a - b)[index]),
    });

    expect(result.failed).toBe(0);
    expect(result.passed).toBe(1);
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
});

describe("formatters", () => {
  test("formatProblemResult includes mode, totals, and failure details", () => {
    const output = formatProblemResult(
      runProblem({ ...passingProblem, solution: () => 0 })
    );

    expect(output).toContain("FAILED");
    expect(output).toContain("mode: solution");
    expect(output).toContain("Tests: 0/2 passed");
    expect(output).toContain("Test #1 - double two");
    expect(output).toContain("Expected: 4");
    expect(output).toContain("Received: 0");
  });

  test("formatSuiteResult includes mode, totals, and failed problems", () => {
    const output = formatSuiteResult(
      runSuite([{ ...passingProblem, solution: () => 0 }])
    );

    expect(output).toContain("SUITE SUMMARY");
    expect(output).toContain("Mode: solution");
    expect(output).toContain("Problems: 0/1 passed");
    expect(output).toContain("Sample Problem (sample-001)");
  });
});
