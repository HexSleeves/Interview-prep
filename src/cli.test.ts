import { describe, expect, test } from "bun:test";

const cli = async (...args: string[]) => {
  const proc = Bun.spawn(["bun", ".", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { stdout, stderr, exitCode };
};

describe("cli", () => {
  test("check --all exits successfully against reference solutions", async () => {
    const result = await cli("check", "--all");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Mode: reference");
    expect(result.stdout).toContain("Problems: 8/8 passed");
  });

  test("run executes editable learner solution and exits nonzero for TODO problems", async () => {
    const result = await cli("run", "freq-001");

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("FAILED");
    expect(result.stdout).toContain("mode: solution");
  });

  test("list can filter by domain", async () => {
    const result = await cli("list", "frequency");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("freq-001");
    expect(result.stdout).toContain("Top K Frequent Elements");
  });

  test("show prints problem details and optional hints", async () => {
    const result = await cli("show", "bst-001", "--hints");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Validate Binary Search Tree");
    expect(result.stdout).toContain("Difficulty: medium");
    expect(result.stdout).toContain("Hints:");
  });

  test("show can list available solution approaches without source code", async () => {
    const result = await cli("show", "freq-001", "--solutions");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Solutions:");
    expect(result.stdout).toContain("optimized");
    expect(result.stdout).not.toContain("const freqMap");
  });
});
