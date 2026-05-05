# Plan: Socratic AI Coach — Browser Editor

Date: 2026-05-04
Spec: lecoqjacob-main-design-20260504-104617.md

## Overview

Build a browser-based coding interview tool: Monaco editor + problem browser + Socratic AI coach.
Uses Bun.serve() with HTML import. Reuses `src/runner`, `src/registry`, `src/problems`.

Stack: `Bun.serve()` + React + `@monaco-editor/react` + `@anthropic-ai/sdk`

## Dependency Install (pre-task)

Run once before any task:

```
bun add react react-dom @monaco-editor/react @anthropic-ai/sdk
bun add -d @types/react @types/react-dom
```

---

### Task 1: Install frontend and AI SDK dependencies

**Files:**

- Modify: `/Users/lecoqjacob/Developer/Interview-prep/package.json`

- [ ] Step 1: Run `bun add react react-dom @monaco-editor/react @anthropic-ai/sdk` from `/Users/lecoqjacob/Developer/Interview-prep`
- [ ] Step 2: Run `bun add -d @types/react @types/react-dom` from `/Users/lecoqjacob/Developer/Interview-prep`
- [ ] Step 3: Verify `package.json` contains entries for `react`, `react-dom`, `@monaco-editor/react`, `@anthropic-ai/sdk` in dependencies
- [ ] Step 4: Commit: `git commit -m "chore: add react, monaco-editor, and anthropic SDK dependencies"`

---

### Task 2: Write failing tests for the harness generator utility

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/harness.test.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import { describe, expect, test } from "bun:test";
import { buildHarness, extractStarterCode } from "./harness.ts";

describe("buildHarness", () => {
  test("injects SERVER_ROOT as an absolute path string", () => {
    const result = buildHarness({
      serverRoot: "/tmp/myproject",
      problemId: "window-001",
      userCode:
        'const solution = (_input: Input): Output => { throw new Error("not implemented"); };',
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
    const userCode =
      "type Input = string;\ntype Output = number;\nconst solution = (_input: Input): Output => 42;";
    const result = buildHarness({ serverRoot: "/tmp", problemId: "test-001", userCode });
    expect(result).toContain(userCode);
  });

  test("output ends with process.stdout.write(JSON.stringify(result))", () => {
    const result = buildHarness({
      serverRoot: "/tmp",
      problemId: "x",
      userCode: "const solution = (_input: Input): Output => null as any;",
    });
    expect(result.trimEnd()).toMatch(
      /process\.stdout\.write\(JSON\.stringify\(result\)\)\s*;?\s*$/,
    );
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
    expect(result).not.toContain("import { TreeNode }");
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
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/harness.test.ts` — confirm all tests FAIL (file not found)
- [ ] Step 3: Commit: `git commit -m "test: add failing tests for harness generator utility"`

---

### Task 3: Implement the harness generator utility

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/harness.ts`

- [ ] Step 1: Create the file with this content:

```typescript
const TREE_NODE_INLINE = `class TreeNode<T = number> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  constructor(val: T, left: TreeNode<T> | null = null, right: TreeNode<T> | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
`;

export interface BuildHarnessOptions {
  serverRoot: string;
  problemId: string;
  userCode: string;
}

export function buildHarness({ serverRoot, problemId, userCode }: BuildHarnessOptions): string {
  return `import { runProblem } from "${serverRoot}/src/runner/index.ts";
import { allProblems } from "${serverRoot}/src/registry/index.ts";

const problemDef = allProblems.find(p => p.id === "${problemId}")!;

${userCode}

const result = runProblem({ ...problemDef, solution, referenceSolutions: [] });
process.stdout.write(JSON.stringify(result));
`;
}

export function extractStarterCode(fileContent: string, isBst: boolean): string {
  const lines = fileContent.split("\n");

  // Remove import lines
  const withoutImports = lines.filter((line) => !line.trimStart().startsWith("import ")).join("\n");

  // Strip leading `export ` from `export const solution`
  const withoutExport = withoutImports.replace(/^export (const solution)/m, "$1");

  // Find the start of type aliases (first `type Input` or `type Output` line)
  const typeStart = withoutExport.search(/^type (Input|Output)/m);
  const body = typeStart >= 0 ? withoutExport.slice(typeStart) : withoutExport;

  // Trim trailing whitespace/newlines
  const trimmed = body.trimEnd();

  if (isBst) {
    return TREE_NODE_INLINE + trimmed;
  }

  return trimmed;
}
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/harness.test.ts` — confirm all tests PASS
- [ ] Step 3: Commit: `git commit -m "feat: implement harness generator utility"`

---

### Task 4: Write failing tests for the problem API helpers

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/problems-api.test.ts`

- [ ] Step 1: Create the file with this content:

```typescript
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
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/problems-api.test.ts` — confirm all tests FAIL
- [ ] Step 3: Commit: `git commit -m "test: add failing tests for problem API helpers"`

---

### Task 5: Implement the problem API helpers

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/problems-api.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import { allProblems } from "../registry/index.ts";
import { extractStarterCode } from "./harness.ts";

export type ProblemResponse = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  visibleTestCases: Array<{ input: unknown; expected: unknown }>;
  starterCode: string;
};

export async function buildSolutionPathMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const glob = new Bun.Glob("src/problems/**/*.ts");
  for await (const file of glob.scan(".")) {
    if (file.includes("index") || file.includes("_template")) continue;
    try {
      const mod = await import(`../../${file}`);
      if (mod.problem?.id) {
        map.set(mod.problem.id, file.replace("src/problems", "src/solutions"));
      }
    } catch {
      // skip unimportable files
    }
  }
  return map;
}

export async function getProblemResponse(
  id: string,
  solutionPathMap: Map<string, string>,
): Promise<ProblemResponse | null> {
  const problem = allProblems.find((p) => p.id === id);
  if (!problem) return null;

  const solutionPath = solutionPathMap.get(id);
  let starterCode = "";
  if (solutionPath) {
    const fileContent = await Bun.file(solutionPath).text();
    const isBst = solutionPath.includes("binary-search-tree");
    starterCode = extractStarterCode(fileContent, isBst);
  }

  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags,
    visibleTestCases: problem.testCases.slice(0, 2).map((tc) => ({
      input: tc.input,
      expected: tc.expected,
    })),
    starterCode,
  };
}
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/problems-api.test.ts` — confirm all tests PASS
- [ ] Step 3: Commit: `git commit -m "feat: implement problem API helpers with Bun.Glob path scanning"`

---

### Task 6: Write failing tests for the /api/run subprocess handler

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/run-handler.test.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import { describe, expect, test } from "bun:test";
import { runUserCode } from "./run-handler.ts";

describe("runUserCode", () => {
  test("returns ok:true with ProblemResult for a correct solution", async () => {
    const userCode = `type Input = { nums: number[]; k: number };
type Output = number;
const solution = (input: Input): Output => {
  let sum = 0;
  for (let i = 0; i < input.k; i++) sum += input.nums[i]!;
  let max = sum;
  for (let i = input.k; i < input.nums.length; i++) {
    sum += input.nums[i]! - input.nums[i - input.k]!;
    if (sum > max) max = sum;
  }
  return max;
};`;
    const result = await runUserCode("window-001", userCode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.passed).toBeGreaterThan(0);
      expect(result.result.failed).toBe(0);
    }
  }, 10000);

  test("returns ok:true with failures for a wrong solution", async () => {
    const userCode = `type Input = { nums: number[]; k: number };
type Output = number;
const solution = (_input: Input): Output => 0;`;
    const result = await runUserCode("window-001", userCode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.failed).toBeGreaterThan(0);
      expect(result.result.failures[0]?.received).toBe(0);
    }
  }, 10000);

  test("returns ok:false with stderr content for syntax errors", async () => {
    const userCode = `this is not valid typescript !!!`;
    const result = await runUserCode("window-001", userCode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  }, 10000);

  test("returns ok:false for unknown problem id", async () => {
    const userCode = `const solution = (_input: any): any => null;`;
    const result = await runUserCode("does-not-exist-999", userCode);
    // harness will crash because allProblems.find returns undefined — stderr or runtime error
    expect(result.ok).toBe(false);
  }, 10000);

  test("temp harness file is deleted after execution (no accumulation)", async () => {
    const userCode = `type Input = { nums: number[]; k: number };\ntype Output = number;\nconst solution = (_input: Input): Output => 0;`;
    const before = (await Array.fromAsync(new Bun.Glob("/tmp/solution-window-001-*.ts").scan("/")))
      .length;
    await runUserCode("window-001", userCode);
    const after = (await Array.fromAsync(new Bun.Glob("/tmp/solution-window-001-*.ts").scan("/")))
      .length;
    expect(after).toBeLessThanOrEqual(before);
  }, 10000);
});
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/run-handler.test.ts` — confirm all tests FAIL
- [ ] Step 3: Commit: `git commit -m "test: add failing tests for /api/run subprocess handler"`

---

### Task 7: Implement the /api/run subprocess handler

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/run-handler.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import type { ProblemResult } from "../types/problem.ts";
import { buildHarness } from "./harness.ts";

const SERVER_ROOT = process.cwd();

export type RunResult = { ok: true; result: ProblemResult } | { ok: false; error: string };

export async function runUserCode(problemId: string, userCode: string): Promise<RunResult> {
  const ts = Date.now();
  const harnessPath = `/tmp/solution-${problemId}-${ts}.ts`;

  const harness = buildHarness({ serverRoot: SERVER_ROOT, problemId, userCode });
  await Bun.write(harnessPath, harness);

  const proc = Bun.spawn(["bun", "run", harnessPath], {
    stdout: "pipe",
    stderr: "pipe",
  });

  try {
    await proc.exited;
    const stdout = await new Response(proc.stdout).text();
    try {
      const result = JSON.parse(stdout) as ProblemResult;
      return { ok: true, result };
    } catch {
      const stderr = await new Response(proc.stderr).text();
      return { ok: false, error: stderr || "Unknown error: empty stdout" };
    }
  } finally {
    try {
      await Bun.file(harnessPath).unlink();
    } catch {
      // ignore cleanup errors
    }
  }
}
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/run-handler.test.ts` — confirm all tests PASS
- [ ] Step 3: Commit: `git commit -m "feat: implement run-handler using Bun.spawn subprocess with try/finally cleanup"`

---

### Task 8: Write failing tests for the /api/hint handler

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/hint-handler.test.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import { describe, expect, test } from "bun:test";
import { buildHintMessages, SOCRATIC_SYSTEM_PROMPT } from "./hint-handler.ts";
import type { HintRequest } from "./hint-handler.ts";

describe("buildHintMessages", () => {
  const baseRequest: HintRequest = {
    problem: {
      id: "window-001",
      title: "Maximum Sum Subarray of Size K",
      description: "Find maximum sum subarray of size k.",
      difficulty: "easy",
      tags: ["sliding-window"],
    },
    userCode: "const solution = (_input: Input): Output => 0;",
    testResult: { passed: 0, total: 6 },
    failingCase: { input: { nums: [2, 1, 5, 1, 3, 2], k: 3 }, expected: 9, received: 0 },
    previousHints: [],
  };

  test("returns array of messages with user role", () => {
    const messages = buildHintMessages(baseRequest);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[messages.length - 1]!.role).toBe("user");
  });

  test("user message includes problem title", () => {
    const messages = buildHintMessages(baseRequest);
    const userMsg = messages.find((m) => m.role === "user")!;
    expect(userMsg.content).toContain("Maximum Sum Subarray of Size K");
  });

  test("user message includes user code", () => {
    const messages = buildHintMessages(baseRequest);
    const userMsg = messages.find((m) => m.role === "user")!;
    expect(userMsg.content).toContain("const solution");
  });

  test("user message includes failing case", () => {
    const messages = buildHintMessages(baseRequest);
    const userMsg = messages.find((m) => m.role === "user")!;
    expect(userMsg.content).toContain("9");
  });

  test("previous hints are included in messages as assistant turns", () => {
    const req = { ...baseRequest, previousHints: ["What is the window size?"] };
    const messages = buildHintMessages(req);
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    expect(assistantMsgs.length).toBe(1);
    expect(assistantMsgs[0]!.content).toBe("What is the window size?");
  });

  test("does not include testCases or hints from ProblemDefinition in messages", () => {
    const messages = buildHintMessages(baseRequest);
    const allContent = messages.map((m) => m.content).join(" ");
    // These are the static hints from the problem — should not appear
    expect(allContent).not.toContain("Use a sliding window of size k");
  });
});

describe("SOCRATIC_SYSTEM_PROMPT", () => {
  test("contains the hard rules about asking one question", () => {
    expect(SOCRATIC_SYSTEM_PROMPT).toContain("one question");
  });

  test("prohibits giving code", () => {
    expect(SOCRATIC_SYSTEM_PROMPT).toMatch(/no code|never.*code|do not.*code/i);
  });
});
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/hint-handler.test.ts` — confirm all tests FAIL
- [ ] Step 3: Commit: `git commit -m "test: add failing tests for hint handler message builder"`

---

### Task 9: Implement the hint handler

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/hint-handler.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import Anthropic from "@anthropic-ai/sdk";

export const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic coding coach. Your only job is to help the learner discover the answer themselves.

Hard rules:
- Ask exactly one question per response. Never more.
- Never give code, pseudocode, or algorithm names the learner has not already used.
- Never state the answer or the fix directly.
- Point at the smallest suspicious assumption in the learner's code.
- Prefer questions about invariants, edge cases, and trace reasoning.
- If the learner is on the right track, ask them to verify their reasoning on the failing case.
- Your response is a single question only. No preamble, no summary.`;

export type ProblemContext = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
};

export type HintRequest = {
  problem: ProblemContext;
  userCode: string;
  testResult: { passed: boolean | number; total: number };
  failingCase: { input: unknown; expected: unknown; received: unknown } | null;
  previousHints: string[];
};

type Message = { role: "user" | "assistant"; content: string };

export function buildHintMessages(req: HintRequest): Message[] {
  const messages: Message[] = [];

  // Interleave previous hints as assistant turns with placeholder user turns
  for (const hint of req.previousHints) {
    messages.push({
      role: "user",
      content: "Please give me a hint.",
    });
    messages.push({ role: "assistant", content: hint });
  }

  // Build the current user message
  const failingSection = req.failingCase
    ? `\nFailing test case:\n  Input: ${JSON.stringify(req.failingCase.input)}\n  Expected: ${JSON.stringify(req.failingCase.expected)}\n  Received: ${JSON.stringify(req.failingCase.received)}`
    : "\nNo failing case — all tests passed (or none run yet).";

  const userContent = `Problem: ${req.problem.title} (${req.problem.difficulty})
Domain: ${req.problem.tags.join(", ")}
Description: ${req.problem.description}

Test result: ${JSON.stringify(req.testResult)}${failingSection}

My current code:
\`\`\`typescript
${req.userCode}
\`\`\`

Ask me one Socratic question about what might be wrong.`;

  messages.push({ role: "user", content: userContent });
  return messages;
}

const HINT_TIMEOUT_MS = 4000;
const FALLBACK_HINT = "Coach is unavailable — try again in a moment.";

export async function getHint(req: HintRequest): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return FALLBACK_HINT;

  const client = new Anthropic({ apiKey });
  const messages = buildHintMessages(req);

  try {
    const result = await Promise.race([
      client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: SOCRATIC_SYSTEM_PROMPT,
        messages,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("hint timeout")), HINT_TIMEOUT_MS),
      ),
    ]);

    const block = result.content[0];
    if (block?.type === "text") return block.text;
    return FALLBACK_HINT;
  } catch {
    return FALLBACK_HINT;
  }
}
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/hint-handler.test.ts` — confirm all tests PASS
- [ ] Step 3: Commit: `git commit -m "feat: implement Socratic hint handler with 4s timeout and graceful fallback"`

---

### Task 10: Create the HTML entry point

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/index.html`

- [ ] Step 1: Create the file with this content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Algorithm Gym</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #1e1e1e;
        color: #d4d4d4;
        height: 100vh;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

- [ ] Step 2: Commit: `git commit -m "feat: add HTML entry point for Bun.serve HTML import"`

---

### Task 11: Create the React frontend (3-pane layout scaffold)

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/frontend.tsx`

- [ ] Step 1: Create the file with this content:

```tsx
import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Editor from "@monaco-editor/react";

// ---- Types ----

type Difficulty = "easy" | "medium" | "hard";

interface VisibleTestCase {
  input: unknown;
  expected: unknown;
}

interface ProblemSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

interface ProblemDetail extends ProblemSummary {
  description: string;
  visibleTestCases: VisibleTestCase[];
  starterCode: string;
}

interface TestFailure {
  solutionId: string;
  testCase: number;
  description?: string;
  expected: unknown;
  received?: unknown;
  error?: string;
}

interface RunResult {
  problemId: string;
  passed: number;
  failed: number;
  total: number;
  failures: TestFailure[];
}

// ---- API helpers ----

async function fetchProblems(): Promise<ProblemSummary[]> {
  const res = await fetch("/api/problems");
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json() as Promise<ProblemSummary[]>;
}

async function fetchProblem(id: string): Promise<ProblemDetail> {
  const res = await fetch(`/api/problems/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch problem ${id}`);
  return res.json() as Promise<ProblemDetail>;
}

async function runCode(
  problemId: string,
  userCode: string,
): Promise<{ ok: true; result: RunResult } | { ok: false; error: string }> {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, userCode }),
  });
  return res.json() as Promise<{ ok: true; result: RunResult } | { ok: false; error: string }>;
}

async function fetchHint(payload: {
  problem: Pick<ProblemDetail, "id" | "title" | "description" | "difficulty" | "tags">;
  userCode: string;
  testResult: { passed: number; total: number };
  failingCase: { input: unknown; expected: unknown; received: unknown } | null;
  previousHints: string[];
}): Promise<string> {
  const res = await fetch("/api/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { hint: string };
  return data.hint;
}

// ---- Styles (inline for single-file) ----

const styles = {
  app: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 360px",
    gridTemplateRows: "48px 1fr",
    height: "100vh",
    gap: 0,
  } as React.CSSProperties,
  header: {
    gridColumn: "1 / -1",
    background: "#252526",
    borderBottom: "1px solid #3e3e42",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 12,
  } as React.CSSProperties,
  leftPane: {
    background: "#252526",
    borderRight: "1px solid #3e3e42",
    overflowY: "auto" as const,
    padding: 12,
  } as React.CSSProperties,
  centerPane: {
    display: "flex",
    flexDirection: "column" as const,
    background: "#1e1e1e",
  } as React.CSSProperties,
  rightPane: {
    background: "#252526",
    borderLeft: "1px solid #3e3e42",
    overflowY: "auto" as const,
    padding: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  } as React.CSSProperties,
  editorToolbar: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    background: "#2d2d30",
    borderBottom: "1px solid #3e3e42",
  } as React.CSSProperties,
  btn: {
    padding: "5px 14px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  } as React.CSSProperties,
  btnPrimary: { background: "#0e639c", color: "#fff" } as React.CSSProperties,
  btnSecondary: { background: "#3a3d41", color: "#d4d4d4" } as React.CSSProperties,
  problemItem: {
    padding: "7px 10px",
    borderRadius: 4,
    cursor: "pointer",
    marginBottom: 2,
    fontSize: 13,
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
  } as React.CSSProperties,
} as const;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "#4ec994",
  medium: "#e5c07b",
  hard: "#e06c75",
};

const DOMAINS = ["all", "binary-search-tree", "frequency", "prefix-sum", "sliding-window"] as const;
type DomainFilter = (typeof DOMAINS)[number];

// ---- Components ----

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      style={{
        ...styles.badge,
        background: DIFFICULTY_COLORS[difficulty] + "22",
        color: DIFFICULTY_COLORS[difficulty],
      }}
    >
      {difficulty}
    </span>
  );
}

function LeftPane({
  problems,
  selectedId,
  onSelect,
}: {
  problems: ProblemSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [domain, setDomain] = useState<DomainFilter>("all");

  const filtered = domain === "all" ? problems : problems.filter((p) => p.tags.includes(domain));

  return (
    <div style={styles.leftPane}>
      <div style={{ marginBottom: 10 }}>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value as DomainFilter)}
          style={{
            width: "100%",
            background: "#3a3d41",
            color: "#d4d4d4",
            border: "1px solid #3e3e42",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 13,
          }}
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "All Domains" : d}
            </option>
          ))}
        </select>
      </div>
      {filtered.map((p) => (
        <div
          key={p.id}
          style={{
            ...styles.problemItem,
            background: selectedId === p.id ? "#094771" : "transparent",
          }}
          onClick={() => onSelect(p.id)}
        >
          <div style={{ marginBottom: 3 }}>{p.title}</div>
          <DifficultyBadge difficulty={p.difficulty} />
        </div>
      ))}
    </div>
  );
}

function ProblemPanel({ problem }: { problem: ProblemDetail }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 6 }}>{problem.title}</h2>
      <DifficultyBadge difficulty={problem.difficulty} />
      <pre
        style={{
          marginTop: 10,
          fontSize: 13,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          color: "#abb2bf",
        }}
      >
        {problem.description}
      </pre>
      {problem.visibleTestCases.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Examples</div>
          {problem.visibleTestCases.map((tc, i) => (
            <div
              key={i}
              style={{
                background: "#1e1e1e",
                borderRadius: 4,
                padding: "8px 10px",
                marginBottom: 6,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              <div>
                <span style={{ color: "#888" }}>Input: </span>
                {JSON.stringify(tc.input)}
              </div>
              <div>
                <span style={{ color: "#888" }}>Expected: </span>
                {JSON.stringify(tc.expected)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  runResult,
  compileError,
  hint,
  hintLoading,
  onAskCoach,
}: {
  runResult: RunResult | null;
  compileError: string | null;
  hint: string | null;
  hintLoading: boolean;
  onAskCoach: () => void;
}) {
  if (compileError) {
    return (
      <div>
        <div style={{ color: "#e06c75", fontWeight: 600, marginBottom: 8 }}>Compile Error</div>
        <pre style={{ fontSize: 12, color: "#e06c75", whiteSpace: "pre-wrap" }}>{compileError}</pre>
      </div>
    );
  }

  if (!runResult) {
    return <div style={{ color: "#666", fontSize: 13 }}>Run your code to see results.</div>;
  }

  const allPassed = runResult.failed === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: allPassed ? "#4ec994" : "#e06c75",
        }}
      >
        {allPassed
          ? `All ${runResult.total} tests passed`
          : `${runResult.passed}/${runResult.total} passed`}
      </div>

      {!allPassed && runResult.failures.length > 0 && (
        <div>
          {runResult.failures.slice(0, 3).map((f, i) => (
            <div
              key={i}
              style={{
                background: "#1e1e1e",
                borderRadius: 4,
                padding: "8px 10px",
                marginBottom: 6,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              <div style={{ color: "#888", marginBottom: 4 }}>
                Test #{f.testCase}
                {f.description ? ` — ${f.description}` : ""}
              </div>
              {f.error ? (
                <div style={{ color: "#e06c75" }}>Error: {f.error}</div>
              ) : (
                <>
                  <div>
                    <span style={{ color: "#4ec994" }}>Expected: </span>
                    {JSON.stringify(f.expected)}
                  </div>
                  <div>
                    <span style={{ color: "#e06c75" }}>Received: </span>
                    {JSON.stringify(f.received)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        style={{ ...styles.btn, ...styles.btnSecondary }}
        onClick={onAskCoach}
        disabled={hintLoading}
      >
        {hintLoading ? "Coach thinking..." : "Ask Coach"}
      </button>

      {hint && (
        <div
          style={{
            background: "#1e1e1e",
            border: "1px solid #3e3e42",
            borderRadius: 4,
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#abb2bf",
            fontStyle: "italic",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ---- Main App ----

function App() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState<string>("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [previousHints, setPreviousHints] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchProblems().then(setProblems).catch(console.error);
  }, []);

  const handleSelectProblem = useCallback(async (id: string) => {
    setSelectedId(id);
    setRunResult(null);
    setCompileError(null);
    setHint(null);
    setPreviousHints([]);
    try {
      const detail = await fetchProblem(id);
      setProblem(detail);
      setCode(detail.starterCode);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setRunResult(null);
    setCompileError(null);
    try {
      const res = await runCode(problem.id, code);
      if (res.ok) {
        setRunResult(res.result);
      } else {
        setCompileError(res.error);
      }
    } catch (err) {
      setCompileError(String(err));
    } finally {
      setRunning(false);
    }
  }, [problem, code]);

  const handleAskCoach = useCallback(async () => {
    if (!problem) return;
    setHintLoading(true);
    const failingCase = runResult?.failures[0]
      ? {
          input: runResult.failures[0].expected, // test case input not in result — use available fields
          expected: runResult.failures[0].expected,
          received: runResult.failures[0].received ?? null,
        }
      : null;
    try {
      const h = await fetchHint({
        problem: {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
        },
        userCode: code,
        testResult: { passed: runResult?.passed ?? 0, total: runResult?.total ?? 0 },
        failingCase,
        previousHints,
      });
      setHint(h);
      setPreviousHints((prev) => [...prev, h]);
    } catch {
      setHint("Coach is unavailable — try again in a moment.");
    } finally {
      setHintLoading(false);
    }
  }, [problem, code, runResult, previousHints]);

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#e5c07b" }}>Algorithm Gym</span>
        {problem && <span style={{ fontSize: 13, color: "#888" }}>{problem.id}</span>}
      </div>

      {/* Left pane */}
      <LeftPane problems={problems} selectedId={selectedId} onSelect={handleSelectProblem} />

      {/* Center pane */}
      <div style={styles.centerPane}>
        {problem ? (
          <>
            <div style={styles.editorToolbar}>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onClick={handleRun}
                disabled={running}
              >
                {running ? "Running..." : "Run"}
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <Editor
                height="100%"
                language="typescript"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              fontSize: 14,
            }}
          >
            Select a problem to start
          </div>
        )}
      </div>

      {/* Right pane */}
      <div style={styles.rightPane}>
        {problem ? (
          <>
            <ProblemPanel problem={problem} />
            <hr style={{ border: "none", borderTop: "1px solid #3e3e42" }} />
            <ResultPanel
              runResult={runResult}
              compileError={compileError}
              hint={hint}
              hintLoading={hintLoading}
              onAskCoach={handleAskCoach}
            />
          </>
        ) : (
          <div style={{ color: "#555", fontSize: 13 }}>Select a problem to start.</div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

- [ ] Step 2: Commit: `git commit -m "feat: add React frontend with 3-pane layout, Monaco editor, and coach panel"`

---

### Task 12: Create the Bun.serve() server with all API routes

**Files:**

- Modify: `/Users/lecoqjacob/Developer/Interview-prep/index.ts`

- [ ] Step 1: Read current `index.ts` content (it currently just re-exports from src — will be replaced with the server)

> QUESTION: The existing `index.ts` at the root exports `src/types`, `src/runner`, and `src/problems` — this is the CLI entry point referenced by `package.json` `"module": "src/cli.ts"`. The server will replace this file. The CLI will break unless the server is in a separate file. Recommend creating `server.ts` instead and keeping `index.ts` as-is, OR replacing `index.ts` with the server and updating `package.json` `"module"` to `"src/cli.ts"` directly.
>
> **Resolution assumed:** Replace `index.ts` with the server. The CLI is still accessible via `bun src/cli.ts` directly. Update `package.json` `"cli"` script from `bun .` to `bun src/cli.ts`.

- [ ] Step 2: Replace `index.ts` with this content:

```typescript
import index from "./index.html";
import { allProblems } from "./src/registry/index.ts";
import { buildSolutionPathMap, getProblemResponse } from "./src/server/problems-api.ts";
import { runUserCode } from "./src/server/run-handler.ts";
import { getHint } from "./src/server/hint-handler.ts";
import type { HintRequest } from "./src/server/hint-handler.ts";

// Build problem path map once at startup
const solutionPathMap = await buildSolutionPathMap();

const server = Bun.serve({
  routes: {
    "/": index,

    "/api/problems": {
      GET: () => {
        const summaries = allProblems.map((p) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          tags: p.tags,
        }));
        return Response.json(summaries);
      },
    },

    "/api/problems/:id": {
      GET: async (req) => {
        const id = req.params.id;
        const problem = await getProblemResponse(id, solutionPathMap);
        if (!problem) {
          return Response.json({ error: "Problem not found" }, { status: 404 });
        }
        return Response.json(problem);
      },
    },

    "/api/run": {
      POST: async (req) => {
        let body: { problemId: string; userCode: string };
        try {
          body = (await req.json()) as { problemId: string; userCode: string };
        } catch {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }
        const result = await runUserCode(body.problemId, body.userCode);
        return Response.json(result);
      },
    },

    "/api/hint": {
      POST: async (req) => {
        let body: HintRequest;
        try {
          body = (await req.json()) as HintRequest;
        } catch {
          return Response.json({ hint: "Coach is unavailable — try again in a moment." });
        }
        const hint = await getHint(body);
        return Response.json({ hint });
      },
    },
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Algorithm Gym running at http://localhost:${server.port}`);
```

- [ ] Step 3: Update `package.json` scripts: change `"cli": "bun ."` to `"cli": "bun src/cli.ts"` and `"run": "bun . run"` to `"run": "bun src/cli.ts run"`. Also add `"dev": "bun --hot index.ts"`.
- [ ] Step 4: Commit: `git commit -m "feat: add Bun.serve() server with problem, run, and hint API routes"`

---

### Task 13: Write integration smoke test for the server API routes

**Files:**

- Create: `/Users/lecoqjacob/Developer/Interview-prep/src/server/api.test.ts`

- [ ] Step 1: Create the file with this content:

```typescript
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
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
```

- [ ] Step 2: Run `bun test /Users/lecoqjacob/Developer/Interview-prep/src/server/api.test.ts` — confirm all tests PASS
- [ ] Step 3: Commit: `git commit -m "test: add integration smoke tests for server API handlers"`

---

## Task Execution Order

1. Task 1 — install deps
2. Task 2 — harness tests (RED)
3. Task 3 — harness impl (GREEN)
4. Task 4 — problems-api tests (RED)
5. Task 5 — problems-api impl (GREEN)
6. Task 6 — run-handler tests (RED)
7. Task 7 — run-handler impl (GREEN)
8. Task 8 — hint-handler tests (RED)
9. Task 9 — hint-handler impl (GREEN)
10. Task 10 — index.html
11. Task 11 — frontend.tsx
12. Task 12 — index.ts server
13. Task 13 — integration tests (should be GREEN after all impl tasks)

## Verification

After all tasks, run:

```
bun --hot index.ts
```

Open `http://localhost:3000`, select a problem, write code, click Run, click Ask Coach.
