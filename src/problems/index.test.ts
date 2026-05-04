import { describe, expect, test } from "bun:test";
import { allProblemDefinitions } from "./index.ts";
import { allProblems, problemsByDomain } from "../registry/index.ts";

describe("problem organization", () => {
  test("problem definitions do not expose executable solutions", () => {
    for (const definition of allProblemDefinitions) {
      expect("solution" in definition).toBe(false);
      expect("referenceSolutions" in definition).toBe(false);
    }
  });

  test("registry composes definitions with learner and reference solutions", () => {
    expect(allProblems).toHaveLength(allProblemDefinitions.length);

    for (const problem of allProblems) {
      expect(problem.solution).toBeFunction();
      expect(problem.referenceSolutions.length).toBeGreaterThan(0);
      expect(problem.referenceSolutions[0]?.implementation).toBeFunction();
    }
  });

  test("problem ids are unique", () => {
    const ids = allProblems.map((problem) => problem.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("reference solution ids are unique per problem", () => {
    for (const problem of allProblems) {
      const solutionIds = problem.referenceSolutions.map((solution) => solution.id);
      expect(new Set(solutionIds).size).toBe(solutionIds.length);
    }
  });

  test("each problem has optimized reference solution metadata", () => {
    for (const problem of allProblems) {
      const optimized = problem.referenceSolutions.find((solution) => solution.id === "optimized");
      expect(optimized).toBeDefined();
      expect(optimized?.title).toBeTruthy();
      expect(optimized?.description).toBeTruthy();
      expect(optimized?.timeComplexity).toBeTruthy();
      expect(optimized?.spaceComplexity).toBeTruthy();
    }
  });

  test("problem ids match domain prefixes", () => {
    const expectedPrefixes = {
      "binary-search-tree": "bst-",
      frequency: "freq-",
      "prefix-sum": "prefix-",
      "sliding-window": "window-",
    };

    for (const [domain, problems] of Object.entries(problemsByDomain)) {
      for (const problem of problems) {
        expect(
          problem.id.startsWith(expectedPrefixes[domain as keyof typeof expectedPrefixes]),
        ).toBe(true);
      }
    }
  });
});
