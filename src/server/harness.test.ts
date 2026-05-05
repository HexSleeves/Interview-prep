import { describe, expect, test } from "bun:test";
import { buildHarness, extractStarterCode } from "./harness.ts";

describe("buildHarness", () => {
  test("injects SERVER_ROOT as an absolute path string", () => {
    const result = buildHarness({
      serverRoot: "/tmp/myproject",
      problemId: "window-001",
      userCode: 'const solution = (_input: Input): Output => { throw new Error("not implemented"); };',
    });
    expect(result).toContain('"/tmp/myproject/src/runner/index.ts"');
    expect(result).toContain('"/tmp/myproject/src/registry/index.ts"');
  });

  test("replaces PROBLEM_ID with the given id", () => {
    const result = buildHarness({
      serverRoot: "/tmp",
      problemId: "bst-002",
      userCode: "const solution = (_input: Input): Output => null as any;",
    });
    expect(result).toContain('"bst-002"');
  });

  test("injects user code verbatim between imports and runProblem call", () => {
    const userCode = 'type Input = string;\ntype Output = number;\nconst solution = (_input: Input): Output => 42;';
    const result = buildHarness({ serverRoot: "/tmp", problemId: "test-001", userCode });
    expect(result).toContain(userCode);
  });

  test("output ends with process.stdout.write(JSON.stringify(result))", () => {
    const result = buildHarness({
      serverRoot: "/tmp",
      problemId: "x",
      userCode: "const solution = (_input: Input): Output => null as any;",
    });
    expect(result.trimEnd()).toMatch(/process\.stdout\.write\(JSON\.stringify\(result\)\)\s*;?\s*$/);
  });
});

describe("extractStarterCode", () => {
  test("strips only the export keyword, keeps type aliases and const solution", () => {
    const src = `import { TreeNode } from "../../types/tree.ts";\n\ntype Input = { root: TreeNode | null; k: number };\ntype Output = number;\n\nexport const solution = (_input: Input): Output => {\n  throw new Error("not implemented");\n};\n`;
    const result = extractStarterCode(src, false);
    expect(result).not.toContain("import ");
    expect(result).toContain("type Input =");
    expect(result).toContain("type Output =");
    expect(result).toContain("const solution =");
    expect(result).not.toMatch(/^export const solution/m);
  });

  test("strips export keyword from const solution line", () => {
    const src = `type Input = number;\ntype Output = number;\nexport const solution = (_input: Input): Output => {\n  return 0;\n};\n`;
    const result = extractStarterCode(src, false);
    expect(result).toMatch(/^const solution/m);
    expect(result).not.toMatch(/^export const solution/m);
  });

  test("for BST problems, prepends inline TreeNode class definition", () => {
    const src = `import { TreeNode } from "../../types/tree.ts";\n\ntype Input = { root: TreeNode | null };\ntype Output = boolean;\n\nexport const solution = (_input: Input): Output => {\n  return true;\n};\n`;
    const result = extractStarterCode(src, true);
    expect(result).toContain("class TreeNode");
    expect(result).not.toContain('import { TreeNode }');
  });

  test("non-BST problem does not prepend TreeNode class", () => {
    const src = `type Input = { nums: number[]; k: number };\ntype Output = number;\nexport const solution = (_input: Input): Output => {\n  throw new Error("not implemented");\n};\n`;
    const result = extractStarterCode(src, false);
    expect(result).not.toContain("class TreeNode");
  });

  test("uses brace counting to correctly extract multi-level nested function body", () => {
    const src = `type Input = number;\ntype Output = number;\nexport const solution = (_input: Input): Output => {\n  const helper = (x: number): number => {\n    if (x > 0) {\n      return x;\n    }\n    return 0;\n  };\n  return helper(_input);\n};\n`;
    const result = extractStarterCode(src, false);
    expect(result).toContain("const helper");
    expect(result).toContain("return helper(_input)");
  });
});
