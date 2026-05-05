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
