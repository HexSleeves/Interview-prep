import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const scriptPath = resolve(import.meta.dir, "init-solutions.ts");
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "interview-prep-"));
  tempDirs.push(dir);
  await git(dir, "init", "-b", "main");
  await git(dir, "config", "user.email", "test@example.com");
  await git(dir, "config", "user.name", "Test User");
  await Bun.write(join(dir, "README.md"), "# temp\n");
  await git(dir, "add", "README.md");
  await git(dir, "commit", "-m", "initial commit");
  return dir;
}

async function git(cwd: string, ...args: string[]) {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed\n${stdout}${stderr}`);
  }

  return stdout.trim();
}

async function runInit(cwd: string) {
  const proc = Bun.spawn(["bun", scriptPath], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { stdout, stderr, exitCode };
}

describe("init-solutions", () => {
  test("creates and switches to a solutions branch when missing", async () => {
    const repo = await makeRepo();

    const result = await runInit(repo);

    expect(result.exitCode).toBe(0);
    expect(await git(repo, "branch", "--show-current")).toBe("solutions");
    expect(result.stdout).toContain("Created branch solutions");
  });

  test("switches to an existing solutions branch", async () => {
    const repo = await makeRepo();
    await git(repo, "switch", "-c", "solutions");
    await git(repo, "switch", "main");

    const result = await runInit(repo);

    expect(result.exitCode).toBe(0);
    expect(await git(repo, "branch", "--show-current")).toBe("solutions");
    expect(result.stdout).toContain("Switched to existing branch solutions");
  });

  test("refuses to switch away from main with uncommitted changes", async () => {
    const repo = await makeRepo();
    await Bun.write(join(repo, "README.md"), "# dirty\n");

    const result = await runInit(repo);

    expect(result.exitCode).toBe(1);
    expect(await git(repo, "branch", "--show-current")).toBe("main");
    expect(result.stderr).toContain("Worktree has uncommitted changes");
  });
});
