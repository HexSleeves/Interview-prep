import { describe, expect, test } from "bun:test";
import { allProblemDefinitions } from "./index.ts";
import { allProblems } from "../registry/index.ts";

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
});
