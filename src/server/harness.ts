const TREE_NODE_INLINE = `class TreeNode<T = number> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  constructor(val: T, left: TreeNode<T> | null = null, right: TreeNode<T> | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
`;

export interface BuildHarnessOptions {
  serverRoot: string;
  problemId: string;
  userCode: string;
}

export function buildHarness({ serverRoot, problemId, userCode }: BuildHarnessOptions): string {
  return `import { runProblem } from "${serverRoot}/src/runner/index.ts";
import { allProblems } from "${serverRoot}/src/registry/index.ts";

const problemDef = allProblems.find(p => p.id === "${problemId}")!;

${userCode}

const result = runProblem({ ...problemDef, solution, referenceSolutions: [] });
process.stdout.write(JSON.stringify(result));
`;
}

export function extractStarterCode(fileContent: string, isBst: boolean): string {
  const lines = fileContent.split("\n");

  // Remove import lines
  const withoutImports = lines.filter((line) => !line.trimStart().startsWith("import ")).join("\n");

  // Strip leading `export ` from `export const solution`
  const withoutExport = withoutImports.replace(/^export (const solution)/m, "$1");

  // Find the start of type aliases (first `type Input` or `type Output` line)
  const typeStart = withoutExport.search(/^type (Input|Output)/m);
  const fromTypeAliases = typeStart >= 0 ? withoutExport.slice(typeStart) : withoutExport;

  // Find `const solution` and then the arrow `=> {`
  const solutionIdx = fromTypeAliases.search(/^const solution/m);
  if (solutionIdx < 0) return fromTypeAliases.trimEnd();

  const arrowSearchFrom = fromTypeAliases.indexOf("=> {", solutionIdx);
  if (arrowSearchFrom < 0) return fromTypeAliases.trimEnd();

  // Brace-count from the opening `{` to find the matching closing `}`
  const openBraceIdx = fromTypeAliases.indexOf("{", arrowSearchFrom);
  let depth = 0;
  let closeBraceIdx = openBraceIdx;
  for (let i = openBraceIdx; i < fromTypeAliases.length; i++) {
    const ch = fromTypeAliases[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        closeBraceIdx = i;
        break;
      }
    }
  }

  // Include optional trailing semicolon
  let endIdx = closeBraceIdx + 1;
  if (fromTypeAliases[endIdx] === ";") endIdx++;

  const result = fromTypeAliases.slice(0, endIdx).trimEnd();

  if (isBst) {
    return TREE_NODE_INLINE + result;
  }
  return result;
}
