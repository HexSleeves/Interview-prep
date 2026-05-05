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
