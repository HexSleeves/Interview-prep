import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const scriptPath = resolve(import.meta.dir, "new-problem.ts");
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function makeTempWorkspace(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "interview-prep-new-problem-"));
  tempDirs.push(dir);
  return dir;
}

describe("new-problem", () => {
  test("creates prompt, solution, and reference files", async () => {
    const cwd = await makeTempWorkspace();
    const proc = Bun.spawn(["bun", scriptPath, "frequency", "example-problem"], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    expect(stdout).toContain("Created problem scaffold");
    expect(await Bun.file(join(cwd, "src/problems/frequency/example-problem.ts")).exists()).toBe(
      true,
    );
    expect(await Bun.file(join(cwd, "src/solutions/frequency/example-problem.ts")).exists()).toBe(
      true,
    );
    expect(await Bun.file(join(cwd, "src/reference/frequency/example-problem.ts")).exists()).toBe(
      true,
    );
  });

  test("rejects unknown domains", async () => {
    const cwd = await makeTempWorkspace();
    const proc = Bun.spawn(["bun", scriptPath, "unknown", "example-problem"], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stderr, exitCode] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Unknown domain");
  });
});
