import {
  runProblem,
  runSuite,
  formatProblemResult,
  formatSuiteResult,
} from "./runner/index.ts";
import {
  allProblems,
  problemsByDomain,
  type Domain,
} from "./problems/index.ts";
import type { Problem } from "./types/problem.ts";

const DOMAINS = Object.keys(problemsByDomain) as Domain[];

function printHelp(): void {
  console.log(`
Interview Prep CLI - Practice coding interview problems

Usage:
  bun run cli.ts [command] [options]

Commands:
  list                          List all available problems
  list <domain>                 List problems in a specific domain
  run <problem-id>              Run a specific problem by ID
  run --domain <domain>         Run all problems in a domain
  run --all                     Run all problems (full suite)

Available domains:
  ${DOMAINS.join(", ")}

Examples:
  bun run cli.ts list
  bun run cli.ts list sliding-window
  bun run cli.ts run bst-001
  bun run cli.ts run --domain frequency
  bun run cli.ts run --all
`);
}

function listProblems(domain?: string): void {
  if (domain) {
    if (!DOMAINS.includes(domain as Domain)) {
      console.error(`Unknown domain: ${domain}`);
      console.log(`Available domains: ${DOMAINS.join(", ")}`);
      process.exit(1);
    }

    const problems = problemsByDomain[domain as Domain];
    console.log(`\nProblems in "${domain}":\n`);
    for (const problem of problems) {
      console.log(
        `  ${problem.id.padEnd(12)} | ${problem.difficulty.padEnd(6)} | ${problem.title}`
      );
    }
  } else {
    console.log("\nAll Available Problems:\n");
    for (const [domainName, problems] of Object.entries(problemsByDomain)) {
      console.log(`\n${domainName.toUpperCase()}`);
      console.log("-".repeat(50));
      for (const problem of problems) {
        console.log(
          `  ${problem.id.padEnd(12)} | ${problem.difficulty.padEnd(6)} | ${problem.title}`
        );
      }
    }
  }
  console.log("");
}

function findProblemById(id: string): Problem<unknown, unknown> | undefined {
  return allProblems.find((p) => p.id === id);
}

function runProblemById(id: string): void {
  const problem = findProblemById(id);
  if (!problem) {
    console.error(`Problem not found: ${id}`);
    console.log("Use 'bun run cli.ts list' to see available problems.");
    process.exit(1);
  }

  const result = runProblem(problem);
  console.log(formatProblemResult(result));

  if (result.failed > 0) {
    process.exit(1);
  }
}

function runDomain(domain: string): void {
  if (!DOMAINS.includes(domain as Domain)) {
    console.error(`Unknown domain: ${domain}`);
    console.log(`Available domains: ${DOMAINS.join(", ")}`);
    process.exit(1);
  }

  const problems = problemsByDomain[domain as Domain];
  console.log(`\nRunning all problems in "${domain}"...\n`);

  const result = runSuite(problems);
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

function runAll(): void {
  console.log("\nRunning full problem suite...\n");

  const result = runSuite(allProblems);
  console.log(formatSuiteResult(result));

  if (result.failedProblems > 0) {
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

const command = args[0];

switch (command) {
  case "list":
    listProblems(args[1]);
    break;

  case "run":
    if (args[1] === "--all") {
      runAll();
    } else if (args[1] === "--domain") {
      if (!args[2]) {
        console.error("Please specify a domain.");
        console.log(`Available domains: ${DOMAINS.join(", ")}`);
        process.exit(1);
      }
      runDomain(args[2]);
    } else if (args[1]) {
      runProblemById(args[1]);
    } else {
      console.error("Please specify a problem ID, --domain <domain>, or --all");
      printHelp();
      process.exit(1);
    }
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
