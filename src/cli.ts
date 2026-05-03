import {
  formatProblemResult,
  formatSuiteResult,
  runProblem,
  runSuite,
} from "./runner/index.ts";
import {
  allProblems,
  problemsByDomain,
  type Domain,
} from "./problems/index.ts";
import type { AnyProblem, RunMode } from "./types/problem.ts";

const DOMAINS = Object.keys(problemsByDomain) as Domain[];

function printHelp(): void {
  console.log(`
Interview Prep CLI - Practice coding interview problems

Usage:
  bun run cli <command> [options]

Commands:
  list                          List all available problems
  list <domain>                 List problems in a specific domain
  show <problem-id>             Show a problem prompt
  show <problem-id> --hints     Show a problem prompt with hints
  run <problem-id>              Run editable learner solution
  run --domain <domain>         Run editable learner solutions in a domain
  run --all                     Run all editable learner solutions
  check <problem-id>            Run reference solution
  check --domain <domain>       Run reference solutions in a domain
  check --all                   Run all reference solutions

Available domains:
  ${DOMAINS.join(", ")}

Examples:
  bun run cli list
  bun run cli list sliding-window
  bun run cli show bst-001 --hints
  bun run cli run bst-001
  bun run cli check --domain frequency
  bun run cli check --all
`);
}

function fail(message: string, details?: string): never {
  console.error(message);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

function getDomain(domain: string): Domain {
  if (!DOMAINS.includes(domain as Domain)) {
    fail(`Unknown domain: ${domain}`, `Available domains: ${DOMAINS.join(", ")}`);
  }

  return domain as Domain;
}

function getProblemById(id: string): AnyProblem {
  const problem = allProblems.find((candidate) => candidate.id === id);
  if (!problem) {
    fail(`Problem not found: ${id}`, "Use 'bun run cli list' to see available problems.");
  }

  return problem;
}

function listProblems(domain?: string): void {
  if (domain) {
    const validDomain = getDomain(domain);
    const problems = problemsByDomain[validDomain];
    console.log(`\nProblems in "${validDomain}":\n`);
    printProblemRows(problems);
    console.log("");
    return;
  }

  console.log("\nAll Available Problems:");
  for (const [domainName, problems] of Object.entries(problemsByDomain)) {
    console.log(`\n${domainName.toUpperCase()}`);
    console.log("-".repeat(50));
    printProblemRows(problems);
  }
  console.log("");
}

function printProblemRows(problems: readonly AnyProblem[]): void {
  for (const problem of problems) {
    console.log(
      `  ${problem.id.padEnd(12)} | ${problem.difficulty.padEnd(6)} | ${problem.title}`
    );
  }
}

function showProblem(id: string | undefined, flags: string[]): void {
  if (!id) {
    fail("Please specify a problem ID.");
  }

  const problem = getProblemById(id);
  const showHints = flags.includes("--hints");

  console.log(`\n${problem.title} (${problem.id})`);
  console.log(`${"=".repeat(problem.title.length + problem.id.length + 3)}`);
  console.log(`Difficulty: ${problem.difficulty}`);
  console.log(`Tags: ${problem.tags.join(", ")}`);
  console.log(`\n${problem.description}`);

  if (showHints && problem.hints && problem.hints.length > 0) {
    console.log("\nHints:");
    for (const hint of problem.hints) {
      console.log(`  - ${hint}`);
    }
  }

  console.log("");
}

function runProblemById(id: string, mode: RunMode): void {
  const result = runProblem(getProblemById(id), { mode });
  console.log(formatProblemResult(result));

  if (result.failed > 0) {
    process.exit(1);
  }
}

function runDomain(domain: string, mode: RunMode): void {
  const validDomain = getDomain(domain);
  const problems = problemsByDomain[validDomain];
  console.log(`\nRunning ${mode} mode for "${validDomain}"...\n`);

  const result = runSuite(problems, { mode });
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

function runAll(mode: RunMode): void {
  console.log(`\nRunning ${mode} mode for all problems...\n`);

  const result = runSuite(allProblems, { mode });
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

function runCommand(args: string[], mode: RunMode): void {
  if (args[0] === "--all") {
    runAll(mode);
    return;
  }

  if (args[0] === "--domain") {
    if (!args[1]) {
      fail("Please specify a domain.", `Available domains: ${DOMAINS.join(", ")}`);
    }
    runDomain(args[1], mode);
    return;
  }

  if (args[0]) {
    runProblemById(args[0], mode);
    return;
  }

  fail("Please specify a problem ID, --domain <domain>, or --all");
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

const [command, ...commandArgs] = args;

switch (command) {
  case "list":
    listProblems(commandArgs[0]);
    break;

  case "show":
    showProblem(commandArgs[0], commandArgs.slice(1));
    break;

  case "run":
    runCommand(commandArgs, "solution");
    break;

  case "check":
    runCommand(commandArgs, "reference");
    break;

  default:
    fail(`Unknown command: ${command}`);
}
