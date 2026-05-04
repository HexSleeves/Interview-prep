const SOLUTIONS_BRANCH = "solutions";
const BASE_BRANCHES = ["main", "master"];

type GitResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

async function git(args: string[]): Promise<GitResult> {
  const proc = Bun.spawn(["git", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
}

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

async function mustGit(args: string[]): Promise<GitResult> {
  const result = await git(args);
  if (result.exitCode !== 0) {
    die(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  }
  return result;
}

async function branchExists(branch: string): Promise<boolean> {
  return (await git(["show-ref", "--verify", "--quiet", `refs/heads/${branch}`])).exitCode === 0;
}

async function remoteBranchExists(branch: string): Promise<boolean> {
  return (
    (await git(["show-ref", "--verify", "--quiet", `refs/remotes/origin/${branch}`])).exitCode === 0
  );
}

async function chooseBaseBranch(): Promise<string | undefined> {
  for (const branch of BASE_BRANCHES) {
    if (await branchExists(branch)) return branch;
  }

  return undefined;
}

async function main(): Promise<void> {
  const insideRepo = await git(["rev-parse", "--is-inside-work-tree"]);
  if (insideRepo.exitCode !== 0 || insideRepo.stdout !== "true") {
    die("Run this from inside the interview-prep git repository.");
  }

  const currentBranch = (await mustGit(["branch", "--show-current"])).stdout;
  const dirtyStatus = (await mustGit(["status", "--porcelain"])).stdout;

  if (currentBranch !== SOLUTIONS_BRANCH && dirtyStatus.length > 0) {
    die(
      [
        "Worktree has uncommitted changes.",
        "Commit or stash them before creating/switching to the solutions branch so main stays clean.",
      ].join("\n"),
    );
  }

  if (currentBranch === SOLUTIONS_BRANCH) {
    console.log("Already on branch solutions.");
    printNextSteps();
    return;
  }

  if (await branchExists(SOLUTIONS_BRANCH)) {
    await mustGit(["switch", SOLUTIONS_BRANCH]);
    console.log("Switched to existing branch solutions.");
    printNextSteps();
    return;
  }

  if (await remoteBranchExists(SOLUTIONS_BRANCH)) {
    await mustGit(["switch", "--track", `origin/${SOLUTIONS_BRANCH}`]);
    console.log("Created local branch solutions from origin/solutions.");
    printNextSteps();
    return;
  }

  const baseBranch = await chooseBaseBranch();
  if (baseBranch) {
    await mustGit(["switch", "-c", SOLUTIONS_BRANCH, baseBranch]);
  } else {
    await mustGit(["switch", "-c", SOLUTIONS_BRANCH]);
  }

  console.log("Created branch solutions.");
  printNextSteps();
}

function printNextSteps(): void {
  console.log("");
  console.log("Use this branch for learner implementations in src/solutions/.");
  console.log("Useful commands:");
  console.log("  bun . list");
  console.log("  bun . show <problem-id> --hints");
  console.log("  bun . run <problem-id>");
  console.log("  bun . run --domain frequency");
  console.log("  bun . check --domain frequency");
}

await main();
