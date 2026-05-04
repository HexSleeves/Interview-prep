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

  test("check domain can filter by solution id", async () => {
    const result = await cli("check", "--domain", "frequency", "--solution", "optimized");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Problems: 2/2 passed");
    expect(result.stdout).toContain("Solutions: 1");
    expect(result.stdout).not.toContain("Solutions: 2");
  });

  test("unknown solution ids exit nonzero with available options", async () => {
    const result = await cli("check", "freq-001", "--solution", "missing");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unknown solution "missing" for freq-001');
    expect(result.stderr).toContain("Available: brute-force, optimized");
  });

  test("missing solution flag value exits nonzero", async () => {
    const result = await cli("check", "freq-001", "--solution");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Please specify a value for --solution.");
  });

  test("bench can run a single problem", async () => {
    const result = await cli("bench", "freq-001", "--solution", "optimized");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("BENCHMARK");
    expect(result.stdout).toContain("freq-001");
    expect(result.stdout).toContain("optimized");
  });
});
