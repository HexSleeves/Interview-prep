import {
  benchmarkProblem,
  benchmarkSuite,
  formatBenchmarkProblemResult,
  formatBenchmarkSuiteResult,
  formatProblemResult,
  formatSuiteResult,
  runProblem,
  runSuite,
} from "./runner/index.ts";
import { allProblems, problemsByDomain, type Domain } from "./registry/index.ts";
import type { AnyProblem, RunMode } from "./types/problem.ts";

const DOMAINS = Object.keys(problemsByDomain) as Domain[];

function printHelp(): void {
  console.log(`
Interview Prep CLI - Practice coding interview problems

Usage:
  bun . <command> [options]

Commands:
  list                          List all available problems
  list <domain>                 List problems in a specific domain
  show <problem-id>             Show a problem prompt
  show <problem-id> --hints     Show a problem prompt with hints
  show <problem-id> --solutions Show available reference approaches
  run <problem-id>              Run editable learner solution
  run --domain <domain>         Run editable learner solutions in a domain
  run --all                     Run all editable learner solutions
  check <problem-id>            Run reference solution
  check --domain <domain>       Run reference solutions in a domain
  check --all                   Run all reference solutions
  check <problem-id> --solution <solution-id>
  bench <problem-id>            Benchmark reference solutions
  bench --domain <domain>       Benchmark reference solutions in a domain
  bench --all                   Benchmark all reference solutions

Available domains:
  ${DOMAINS.join(", ")}

Examples:
  bun . list
  bun . list sliding-window
  bun . show bst-001 --hints
  bun . show freq-001 --solutions
  bun . run bst-001
  bun . check --domain frequency
  bun . check freq-001 --solution optimized
  bun . bench freq-001 --solution optimized
  bun . check --all
`);
}

function fail(message: string, details?: string): never {
  console.error(message);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

function runOrFail(action: () => void): void {
  try {
    action();
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
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
    fail(`Problem not found: ${id}`, "Use 'bun . list' to see available problems.");
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
    console.log(`  ${problem.id.padEnd(12)} | ${problem.difficulty.padEnd(6)} | ${problem.title}`);
  }
}

function showProblem(id: string | undefined, flags: string[]): void {
  if (!id) {
    fail("Please specify a problem ID.");
  }

  const problem = getProblemById(id);
  const showHints = flags.includes("--hints");
  const showSolutions = flags.includes("--solutions");

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

  if (showSolutions) {
    console.log("\nSolutions:");
    for (const solution of problem.referenceSolutions) {
      const complexity = [
        solution.timeComplexity ? `time ${solution.timeComplexity}` : undefined,
        solution.spaceComplexity ? `space ${solution.spaceComplexity}` : undefined,
      ]
        .filter(Boolean)
        .join(", ");
      console.log(`  - ${solution.id}: ${solution.title}${complexity ? ` (${complexity})` : ""}`);
      if (solution.description) {
        console.log(`    ${solution.description}`);
      }
    }
  }

  console.log("");
}

function runProblemById(id: string, mode: RunMode, solutionId?: string): void {
  const result = runProblem(getProblemById(id), { mode, solutionId });
  console.log(formatProblemResult(result));

  if (result.failed > 0) {
    process.exit(1);
  }
}

function runDomain(domain: string, mode: RunMode, solutionId?: string): void {
  const validDomain = getDomain(domain);
  const problems = problemsByDomain[validDomain];
  console.log(`\nRunning ${mode} mode for "${validDomain}"...\n`);

  const result = runSuite(problems, { mode, solutionId });
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

function runAll(mode: RunMode, solutionId?: string): void {
  console.log(`\nRunning ${mode} mode for all problems...\n`);

  const result = runSuite(allProblems, { mode, solutionId });
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

function runCommand(args: string[], mode: RunMode): void {
  const solutionId = getFlagValue(args, "--solution");
  const positionalArgs = removeFlagWithValue(args, "--solution");

  if (positionalArgs[0] === "--all") {
    runAll(mode, solutionId);
    return;
  }

  if (positionalArgs[0] === "--domain") {
    if (!positionalArgs[1]) {
      fail("Please specify a domain.", `Available domains: ${DOMAINS.join(", ")}`);
    }
    runDomain(positionalArgs[1], mode, solutionId);
    return;
  }

  if (positionalArgs[0]) {
    runProblemById(positionalArgs[0], mode, solutionId);
    return;
  }

  fail("Please specify a problem ID, --domain <domain>, or --all");
}

function benchCommand(args: string[]): void {
  const solutionId = getFlagValue(args, "--solution");
  const positionalArgs = removeFlagWithValue(args, "--solution");

  if (positionalArgs[0] === "--all") {
    console.log(formatBenchmarkSuiteResult(benchmarkSuite(allProblems, { solutionId })));
    return;
  }

  if (positionalArgs[0] === "--domain") {
    if (!positionalArgs[1]) {
      fail("Please specify a domain.", `Available domains: ${DOMAINS.join(", ")}`);
    }
    const domain = getDomain(positionalArgs[1]);
    console.log(
      formatBenchmarkSuiteResult(benchmarkSuite(problemsByDomain[domain], { solutionId })),
    );
    return;
  }

  if (positionalArgs[0]) {
    console.log(
      formatBenchmarkProblemResult(
        benchmarkProblem(getProblemById(positionalArgs[0]), { solutionId }),
      ),
    );
    return;
  }

  fail("Please specify a problem ID, --domain <domain>, or --all");
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    fail(`Please specify a value for ${flag}.`);
  }

  return value;
}

function removeFlagWithValue(args: string[], flag: string): string[] {
  const index = args.indexOf(flag);
  if (index === -1) return args;
  return args.filter((_, argIndex) => argIndex !== index && argIndex !== index + 1);
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
    runOrFail(() => runCommand(commandArgs, "solution"));
    break;

  case "check":
    runOrFail(() => runCommand(commandArgs, "reference"));
    break;

  case "bench":
    runOrFail(() => benchCommand(commandArgs));
    break;

  default:
    fail(`Unknown command: ${command}`);
}
