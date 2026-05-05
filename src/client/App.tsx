import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Editor from "@monaco-editor/react";
import "./style.css";

// ---- Types ----

type Difficulty = "easy" | "medium" | "hard";

interface VisibleTestCase {
  input: unknown;
  expected: unknown;
}

interface ProblemSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

interface ProblemDetail extends ProblemSummary {
  description: string;
  visibleTestCases: VisibleTestCase[];
  starterCode: string;
}

interface TestFailure {
  solutionId: string;
  testCase: number;
  description?: string;
  expected: unknown;
  received?: unknown;
  input?: unknown;
  error?: string;
}

interface RunResult {
  problemId: string;
  passed: number;
  failed: number;
  total: number;
  failures: TestFailure[];
}

// ---- API helpers ----

async function fetchProblems(): Promise<ProblemSummary[]> {
  const res = await fetch("/api/problems");
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json() as Promise<ProblemSummary[]>;
}

async function fetchProblem(id: string): Promise<ProblemDetail> {
  const res = await fetch(`/api/problems/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch problem ${id}`);
  return res.json() as Promise<ProblemDetail>;
}

async function runCode(
  problemId: string,
  userCode: string,
): Promise<{ ok: true; result: RunResult } | { ok: false; error: string }> {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, userCode }),
  });
  return res.json() as Promise<{ ok: true; result: RunResult } | { ok: false; error: string }>;
}

async function fetchHint(payload: {
  problem: Pick<ProblemDetail, "id" | "title" | "description" | "difficulty" | "tags">;
  userCode: string;
  testResult: { passed: number; total: number };
  failingCase: { input: unknown; expected: unknown; received: unknown } | null;
  previousHints: string[];
}): Promise<string> {
  const res = await fetch("/api/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { hint: string };
  return data.hint;
}

// ---- Constants ----

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  easy: "bg-emerald-400/10 text-emerald-400",
  medium: "bg-amber-300/10 text-amber-300",
  hard: "bg-red-400/10 text-red-400",
};

const DOMAINS = ["all", "binary-search-tree", "frequency", "prefix-sum", "sliding-window"] as const;
type DomainFilter = (typeof DOMAINS)[number];

// ---- Components ----

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-block rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${DIFFICULTY_BADGE[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function LeftPane({
  problems,
  selectedId,
  onSelect,
}: {
  problems: ProblemSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [domain, setDomain] = useState<DomainFilter>("all");

  const filtered =
    domain === "all" ? problems : problems.filter(p => p.tags.includes(domain));

  return (
    <div className="overflow-y-auto border-r border-zinc-700 bg-zinc-800 p-3">
      <select
        value={domain}
        onChange={e => setDomain(e.target.value as DomainFilter)}
        className="mb-2.5 w-full rounded border border-zinc-700 bg-zinc-700 px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {DOMAINS.map(d => (
          <option key={d} value={d}>
            {d === "all" ? "All Domains" : d}
          </option>
        ))}
      </select>
      {filtered.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`mb-0.5 block w-full cursor-pointer rounded px-2.5 py-1.5 text-left text-sm transition-colors ${
            selectedId === p.id
              ? "bg-blue-900/70 text-zinc-100"
              : "text-zinc-300 hover:bg-zinc-700/60"
          }`}
        >
          <div className="mb-0.5">{p.title}</div>
          <DifficultyBadge difficulty={p.difficulty} />
        </button>
      ))}
    </div>
  );
}

function ProblemPanel({ problem }: { problem: ProblemDetail }) {
  return (
    <div>
      <h2 className="mb-1.5 text-base font-semibold text-zinc-100">{problem.title}</h2>
      <DifficultyBadge difficulty={problem.difficulty} />
      <pre className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-400 font-sans">
        {problem.description}
      </pre>
      {problem.visibleTestCases.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-xs text-zinc-500">Examples</div>
          {problem.visibleTestCases.map((tc, i) => (
            <div
              key={i}
              className="mb-1.5 rounded bg-zinc-900 px-2.5 py-2 font-mono text-xs"
            >
              <div>
                <span className="text-zinc-500">Input: </span>
                {JSON.stringify(tc.input)}
              </div>
              <div>
                <span className="text-zinc-500">Expected: </span>
                {JSON.stringify(tc.expected)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  runResult,
  compileError,
  hint,
  hintLoading,
  onAskCoach,
}: {
  runResult: RunResult | null;
  compileError: string | null;
  hint: string | null;
  hintLoading: boolean;
  onAskCoach: () => void;
}) {
  if (compileError) {
    return (
      <div>
        <div className="mb-2 font-semibold text-red-400">Compile Error</div>
        <pre className="whitespace-pre-wrap text-xs text-red-400">{compileError}</pre>
      </div>
    );
  }

  if (!runResult) {
    return <div className="text-sm text-zinc-500">Run your code to see results.</div>;
  }

  const allPassed = runResult.failed === 0;
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={`text-[15px] font-bold ${
          allPassed ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {allPassed
          ? `All ${runResult.total} tests passed`
          : `${runResult.passed}/${runResult.total} passed`}
      </div>

      {!allPassed && runResult.failures.length > 0 && (
        <div>
          {runResult.failures.slice(0, 3).map((f, i) => (
            <div
              key={i}
              className="mb-1.5 rounded bg-zinc-900 px-2.5 py-2 font-mono text-xs"
            >
              <div className="mb-1 text-zinc-500">
                Test #{f.testCase}
                {f.description ? ` — ${f.description}` : ""}
              </div>
              {f.error ? (
                <div className="text-red-400">Error: {f.error}</div>
              ) : (
                <>
                  <div>
                    <span className="text-emerald-400">Expected: </span>
                    {JSON.stringify(f.expected)}
                  </div>
                  <div>
                    <span className="text-red-400">Received: </span>
                    {JSON.stringify(f.received)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAskCoach}
        disabled={hintLoading}
        className="rounded bg-zinc-700 px-3.5 py-1 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {hintLoading ? "Coach thinking..." : "Ask Coach"}
      </button>

      {hint && (
        <div className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm italic leading-relaxed text-zinc-400">
          {hint}
        </div>
      )}
    </div>
  );
}

// ---- Main App ----

function App() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState<string>("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [previousHints, setPreviousHints] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch(console.error);
  }, []);

  const handleSelectProblem = useCallback(async (id: string) => {
    setSelectedId(id);
    setRunResult(null);
    setCompileError(null);
    setHint(null);
    setPreviousHints([]);
    try {
      const detail = await fetchProblem(id);
      setProblem(detail);
      setCode(detail.starterCode);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setRunResult(null);
    setCompileError(null);
    try {
      const res = await runCode(problem.id, code);
      if (res.ok) {
        setRunResult(res.result);
      } else {
        setCompileError(res.error);
      }
    } catch (err) {
      setCompileError(String(err));
    } finally {
      setRunning(false);
    }
  }, [problem, code]);

  const handleAskCoach = useCallback(async () => {
    if (!problem) return;
    setHintLoading(true);
    const failingCase = runResult?.failures[0]
      ? {
          input: runResult.failures[0].input ?? null,
          expected: runResult.failures[0].expected,
          received: runResult.failures[0].received ?? null,
        }
      : null;
    try {
      const h = await fetchHint({
        problem: {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
        },
        userCode: code,
        testResult: { passed: runResult?.passed ?? 0, total: runResult?.total ?? 0 },
        failingCase,
        previousHints,
      });
      setHint(h);
      setPreviousHints(prev => [...prev, h]);
    } catch {
      setHint("Coach is unavailable — try again in a moment.");
    } finally {
      setHintLoading(false);
    }
  }, [problem, code, runResult, previousHints]);

  return (
    <div className="grid h-screen grid-cols-[260px_1fr_360px] grid-rows-[48px_1fr]">
      {/* Header */}
      <header className="col-span-3 flex items-center gap-3 border-b border-zinc-700 bg-zinc-800 px-4">
        <span className="text-[15px] font-bold text-amber-300">Algorithm Gym</span>
        {problem && <span className="text-[13px] text-zinc-500">{problem.id}</span>}
      </header>

      {/* Left pane */}
      <LeftPane problems={problems} selectedId={selectedId} onSelect={handleSelectProblem} />

      {/* Center pane */}
      <div className="flex flex-col bg-zinc-900">
        {problem ? (
          <>
            <div className="flex gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
              <button
                onClick={handleRun}
                disabled={running}
                className="rounded bg-blue-700 px-3.5 py-1 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? "Running..." : "Run"}
              </button>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language="typescript"
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v ?? "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">
            Select a problem to start
          </div>
        )}
      </div>

      {/* Right pane */}
      <aside className="flex flex-col gap-3 overflow-y-auto border-l border-zinc-700 bg-zinc-800 p-3">
        {problem ? (
          <>
            <ProblemPanel problem={problem} />
            <hr className="border-zinc-700" />
            <ResultPanel
              runResult={runResult}
              compileError={compileError}
              hint={hint}
              hintLoading={hintLoading}
              onAskCoach={handleAskCoach}
            />
          </>
        ) : (
          <div className="text-sm text-zinc-600">Select a problem to start.</div>
        )}
      </aside>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
