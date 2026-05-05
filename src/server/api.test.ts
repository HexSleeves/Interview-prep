import { describe, expect, test, beforeAll } from "bun:test";
import { allProblems } from "../registry/index.ts";
import { buildSolutionPathMap, getProblemResponse } from "./problems-api.ts";
import { runUserCode } from "./run-handler.ts";

// Integration tests that exercise the real helpers end-to-end
// (no HTTP server needed — test the handlers directly)

describe("GET /api/problems equivalent", () => {
  test("allProblems has at least 6 entries", () => {
    expect(allProblems.length).toBeGreaterThanOrEqual(6);
  });

  test("each problem has required fields", () => {
    for (const p of allProblems) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(["easy", "medium", "hard"]).toContain(p.difficulty);
      expect(Array.isArray(p.tags)).toBe(true);
    }
  });
});

describe("GET /api/problems/:id equivalent", () => {
  let map: Map<string, string>;

  beforeAll(async () => {
    map = await buildSolutionPathMap();
  });

  test("returns full problem detail with starterCode for every known problem", async () => {
    for (const p of allProblems) {
      const detail = await getProblemResponse(p.id, map);
      expect(detail).not.toBeNull();
      expect(detail!.starterCode.length).toBeGreaterThan(0);
    }
  }, 30000);
});

describe("POST /api/run equivalent", () => {
  test("a throwing solution returns ok:true with failures (not ok:false)", async () => {
    const code = `type Input = { nums: number[]; k: number };\ntype Output = number;\nconst solution = (_input: Input): Output => { throw new Error("not implemented"); };`;
    const result = await runUserCode("window-001", code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.failed).toBeGreaterThan(0);
      expect(result.result.failures[0]?.error).toContain("not implemented");
    }
  }, 15000);

  test("BST problem runs correctly with inlined TreeNode", async () => {
    const map = await buildSolutionPathMap();
    const detail = await getProblemResponse("bst-002", map);
    expect(detail).not.toBeNull();
    // The starter code should be valid enough to run (even if it throws "not implemented")
    const result = await runUserCode("bst-002", detail!.starterCode);
    // We expect ok:true — compile should succeed even if solution throws
    expect(result.ok).toBe(true);
  }, 15000);
});
