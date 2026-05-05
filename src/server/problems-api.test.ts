import { describe, expect, test } from "bun:test";
import { buildSolutionPathMap, getProblemResponse } from "./problems-api.ts";

describe("buildSolutionPathMap", () => {
  test("returns a Map with at least one entry per known domain", async () => {
    const map = await buildSolutionPathMap();
    expect(map.size).toBeGreaterThan(0);
  });

  test("maps window-001 to src/solutions/sliding-window path", async () => {
    const map = await buildSolutionPathMap();
    const path = map.get("window-001");
    expect(path).toBeDefined();
    expect(path).toContain("src/solutions/sliding-window");
  });

  test("maps bst-002 to src/solutions/binary-search-tree path", async () => {
    const map = await buildSolutionPathMap();
    const path = map.get("bst-002");
    expect(path).toBeDefined();
    expect(path).toContain("src/solutions/binary-search-tree");
  });

  test("does not include _template or index files", async () => {
    const map = await buildSolutionPathMap();
    for (const [id] of map) {
      expect(id).not.toContain("template");
      expect(id).not.toContain("index");
    }
  });
});

describe("getProblemResponse", () => {
  test("returns problem metadata for a known problem id", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("window-001", map);
    expect(resp).not.toBeNull();
    expect(resp!.id).toBe("window-001");
    expect(resp!.title).toBeTruthy();
    expect(resp!.description).toBeTruthy();
    expect(["easy", "medium", "hard"]).toContain(resp!.difficulty);
    expect(Array.isArray(resp!.tags)).toBe(true);
  });

  test("returns at most 2 visible test cases", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("window-001", map);
    expect(resp!.visibleTestCases.length).toBeLessThanOrEqual(2);
  });

  test("starterCode contains type Input and type Output", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("window-001", map);
    expect(resp!.starterCode).toContain("type Input");
    expect(resp!.starterCode).toContain("type Output");
  });

  test("starterCode does not contain export keyword on const solution line", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("window-001", map);
    expect(resp!.starterCode).not.toMatch(/^export const solution/m);
  });

  test("BST problem starterCode contains inlined TreeNode class", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("bst-002", map);
    expect(resp!.starterCode).toContain("class TreeNode");
    expect(resp!.starterCode).not.toContain("import { TreeNode }");
  });

  test("returns null for unknown problem id", async () => {
    const map = await buildSolutionPathMap();
    const resp = await getProblemResponse("does-not-exist", map);
    expect(resp).toBeNull();
  });
});
