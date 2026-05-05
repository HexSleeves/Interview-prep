import { unlink } from "node:fs/promises";
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
      await unlink(harnessPath);
    } catch {
      // ignore cleanup errors
    }
  }
}
