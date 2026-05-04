const DOMAINS = ["binary-search-tree", "frequency", "prefix-sum", "sliding-window"] as const;

type Domain = (typeof DOMAINS)[number];

const [domainArg, slugArg] = Bun.argv.slice(2);

if (!domainArg || !slugArg) {
  die("Usage: bun run new-problem <domain> <slug>");
}

if (!DOMAINS.includes(domainArg as Domain)) {
  die(`Unknown domain: ${domainArg}. Available: ${DOMAINS.join(", ")}`);
}

const domain = domainArg as Domain;
const slug = normalizeSlug(slugArg);

if (slug.length === 0) {
  die("Problem slug must contain at least one letter or number.");
}

const files = [
  {
    path: `src/problems/${domain}/${slug}.ts`,
    content: problemTemplate(slug),
  },
  {
    path: `src/solutions/${domain}/${slug}.ts`,
    content: solutionTemplate(),
  },
  {
    path: `src/reference/${domain}/${slug}.ts`,
    content: referenceTemplate(),
  },
];

for (const file of files) {
  if (await Bun.file(file.path).exists()) {
    die(`Refusing to overwrite existing file: ${file.path}`);
  }
}

for (const file of files) {
  await Bun.write(file.path, file.content);
}

console.log("Created problem scaffold:");
for (const file of files) {
  console.log(`  ${file.path}`);
}
console.log("");
console.log("Next steps:");
console.log(`  1. Fill in the prompt, tests, learner stub, and reference variants for ${slug}.`);
console.log(`  2. Export it from src/problems/${domain}/index.ts.`);
console.log(`  3. Compose it in src/registry/${domain}.ts.`);
console.log("  4. Run bun run test.");

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

function problemTemplate(slug: string): string {
  const title = slug
    .split("-")
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");

  return `import type { ProblemDefinition } from "../../types/problem.ts";

type Input = { values: number[] };
type Output = number;

export const problem: ProblemDefinition<Input, Output> = {
  id: "replace-me",
  title: "${title}",
  description: \`Write the full problem prompt here.\`,
  difficulty: "easy",
  tags: [],
  hints: [],
  testCases: [
    {
      input: { values: [1, 2, 3] },
      expected: 6,
      description: "basic case",
    },
  ],
};
`;
}

function solutionTemplate(): string {
  return `type Input = { values: number[] };
type Output = number;

export const solution = (_input: Input): Output => {
  throw new Error("not implemented");
};
`;
}

function referenceTemplate(): string {
  return `import type { SolutionVariant } from "../../types/problem.ts";

type Input = { values: number[] };
type Output = number;

const optimizedSolution = (input: Input): Output => {
  return input.values.reduce((sum, value) => sum + value, 0);
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "optimized",
    title: "Optimized",
    description: "Describe the optimized approach.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementation: optimizedSolution,
  },
];
`;
}
