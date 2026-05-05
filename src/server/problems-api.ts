import { allProblems } from "../registry/index.ts";
import { extractStarterCode } from "./harness.ts";

export type ProblemResponse = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  visibleTestCases: Array<{ input: unknown; expected: unknown }>;
  starterCode: string;
};

export async function buildSolutionPathMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const glob = new Bun.Glob("src/problems/**/*.ts");
  for await (const file of glob.scan(".")) {
    if (file.includes("index") || file.includes("_template")) continue;
    try {
      const mod = await import(`../../${file}`);
      if (mod.problem?.id) {
        map.set(mod.problem.id, file.replace("src/problems", "src/solutions"));
      }
    } catch {
      // skip unimportable files
    }
  }
  return map;
}

export async function getProblemResponse(
  id: string,
  solutionPathMap: Map<string, string>,
): Promise<ProblemResponse | null> {
  const problem = allProblems.find((p) => p.id === id);
  if (!problem) return null;

  const solutionPath = solutionPathMap.get(id);
  let starterCode = "";
  if (solutionPath) {
    const fileContent = await Bun.file(solutionPath).text();
    const isBst = solutionPath.includes("binary-search-tree");
    starterCode = extractStarterCode(fileContent, isBst);
  }

  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags,
    visibleTestCases: problem.testCases.slice(0, 2).map((tc) => ({
      input: tc.input,
      expected: tc.expected,
    })),
    starterCode,
  };
}
