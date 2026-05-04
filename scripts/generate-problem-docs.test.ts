import { describe, expect, test } from "bun:test";

describe("problem docs", () => {
  test("README problem list is generated from registry data", async () => {
    const readmeBefore = await Bun.file("README.md").text();
    const proc = Bun.spawn(["bun", "scripts/generate-problem-docs.ts"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    const readmeAfter = await Bun.file("README.md").text();

    expect(exitCode).toBe(0);
    expect(readmeAfter).toBe(readmeBefore);
  });
});
