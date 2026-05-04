import { problemsByDomain } from "../src/registry/index.ts";

const README_PATH = "README.md";
const START = "<!-- problems:start -->";
const END = "<!-- problems:end -->";

function renderProblemList(): string {
  const lines: string[] = [START];

  for (const [domain, problems] of Object.entries(problemsByDomain)) {
    lines.push("");
    lines.push(`### ${formatDomainName(domain)}`);
    lines.push("");

    for (const problem of problems) {
      lines.push(`- \`${problem.id}\` - ${problem.title} (${problem.difficulty})`);
    }
  }

  lines.push("");
  lines.push(END);
  return lines.join("\n");
}

function formatDomainName(domain: string): string {
  return domain
    .split("-")
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}

const readme = await Bun.file(README_PATH).text();
const start = readme.indexOf(START);
const end = readme.indexOf(END);

if (start === -1 || end === -1 || end < start) {
  console.error(`Could not find ${START}/${END} markers in ${README_PATH}.`);
  process.exit(1);
}

const updatedReadme = `${readme.slice(0, start)}${renderProblemList()}${readme.slice(end + END.length)}`;
await Bun.write(README_PATH, updatedReadme);
console.log("Updated README problem list.");
