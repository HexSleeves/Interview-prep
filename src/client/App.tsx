import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Editor from "@monaco-editor/react";

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

// ---- Styles (inline for single-file) ----

const styles = {
  app: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 360px",
    gridTemplateRows: "48px 1fr",
    height: "100vh",
    gap: 0,
  } as React.CSSProperties,
  header: {
    gridColumn: "1 / -1",
    background: "#252526",
    borderBottom: "1px solid #3e3e42",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 12,
  } as React.CSSProperties,
  leftPane: {
    background: "#252526",
    borderRight: "1px solid #3e3e42",
    overflowY: "auto" as const,
    padding: 12,
  } as React.CSSProperties,
  centerPane: {
    display: "flex",
    flexDirection: "column" as const,
    background: "#1e1e1e",
  } as React.CSSProperties,
  rightPane: {
    background: "#252526",
    borderLeft: "1px solid #3e3e42",
    overflowY: "auto" as const,
    padding: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  } as React.CSSProperties,
  editorToolbar: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    background: "#2d2d30",
    borderBottom: "1px solid #3e3e42",
  } as React.CSSProperties,
  btn: {
    padding: "5px 14px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  } as React.CSSProperties,
  btnPrimary: { background: "#0e639c", color: "#fff" } as React.CSSProperties,
  btnSecondary: { background: "#3a3d41", color: "#d4d4d4" } as React.CSSProperties,
  problemItem: {
    padding: "7px 10px",
    borderRadius: 4,
    cursor: "pointer",
    marginBottom: 2,
    fontSize: 13,
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
  } as React.CSSProperties,
} as const;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "#4ec994",
  medium: "#e5c07b",
  hard: "#e06c75",
};

const DOMAINS = ["all", "binary-search-tree", "frequency", "prefix-sum", "sliding-window"] as const;
type DomainFilter = (typeof DOMAINS)[number];

// ---- Components ----

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      style={{
        ...styles.badge,
        background: DIFFICULTY_COLORS[difficulty] + "22",
        color: DIFFICULTY_COLORS[difficulty],
      }}
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
    <div style={styles.leftPane}>
      <div style={{ marginBottom: 10 }}>
        <select
          value={domain}
          onChange={e => setDomain(e.target.value as DomainFilter)}
          style={{
            width: "100%",
            background: "#3a3d41",
            color: "#d4d4d4",
            border: "1px solid #3e3e42",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 13,
          }}
        >
          {DOMAINS.map(d => (
            <option key={d} value={d}>
              {d === "all" ? "All Domains" : d}
            </option>
          ))}
        </select>
      </div>
      {filtered.map(p => (
        <div
          key={p.id}
          style={{
            ...styles.problemItem,
            background: selectedId === p.id ? "#094771" : "transparent",
          }}
          onClick={() => onSelect(p.id)}
        >
          <div style={{ marginBottom: 3 }}>{p.title}</div>
          <DifficultyBadge difficulty={p.difficulty} />
        </div>
      ))}
    </div>
  );
}

function ProblemPanel({ problem }: { problem: ProblemDetail }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 6 }}>{problem.title}</h2>
      <DifficultyBadge difficulty={problem.difficulty} />
      <pre
        style={{
          marginTop: 10,
          fontSize: 13,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          color: "#abb2bf",
        }}
      >
        {problem.description}
      </pre>
      {problem.visibleTestCases.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Examples</div>
          {problem.visibleTestCases.map((tc, i) => (
            <div
              key={i}
              style={{
                background: "#1e1e1e",
                borderRadius: 4,
                padding: "8px 10px",
                marginBottom: 6,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              <div>
                <span style={{ color: "#888" }}>Input: </span>
                {JSON.stringify(tc.input)}
              </div>
              <div>
                <span style={{ color: "#888" }}>Expected: </span>
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
        <div style={{ color: "#e06c75", fontWeight: 600, marginBottom: 8 }}>Compile Error</div>
        <pre style={{ fontSize: 12, color: "#e06c75", whiteSpace: "pre-wrap" }}>{compileError}</pre>
      </div>
    );
  }

  if (!runResult) {
    return (
      <div style={{ color: "#666", fontSize: 13 }}>
        Run your code to see results.
      </div>
    );
  }

  const allPassed = runResult.failed === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: allPassed ? "#4ec994" : "#e06c75",
        }}
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
              style={{
                background: "#1e1e1e",
                borderRadius: 4,
                padding: "8px 10px",
                marginBottom: 6,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              <div style={{ color: "#888", marginBottom: 4 }}>
                Test #{f.testCase}
                {f.description ? ` — ${f.description}` : ""}
              </div>
              {f.error ? (
                <div style={{ color: "#e06c75" }}>Error: {f.error}</div>
              ) : (
                <>
                  <div>
                    <span style={{ color: "#4ec994" }}>Expected: </span>
                    {JSON.stringify(f.expected)}
                  </div>
                  <div>
                    <span style={{ color: "#e06c75" }}>Received: </span>
                    {JSON.stringify(f.received)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        style={{ ...styles.btn, ...styles.btnSecondary }}
        onClick={onAskCoach}
        disabled={hintLoading}
      >
        {hintLoading ? "Coach thinking..." : "Ask Coach"}
      </button>

      {hint && (
        <div
          style={{
            background: "#1e1e1e",
            border: "1px solid #3e3e42",
            borderRadius: 4,
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#abb2bf",
            fontStyle: "italic",
          }}
        >
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
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#e5c07b" }}>Algorithm Gym</span>
        {problem && (
          <span style={{ fontSize: 13, color: "#888" }}>
            {problem.id}
          </span>
        )}
      </div>

      {/* Left pane */}
      <LeftPane
        problems={problems}
        selectedId={selectedId}
        onSelect={handleSelectProblem}
      />

      {/* Center pane */}
      <div style={styles.centerPane}>
        {problem ? (
          <>
            <div style={styles.editorToolbar}>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onClick={handleRun}
                disabled={running}
              >
                {running ? "Running..." : "Run"}
              </button>
            </div>
            <div style={{ flex: 1 }}>
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
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              fontSize: 14,
            }}
          >
            Select a problem to start
          </div>
        )}
      </div>

      {/* Right pane */}
      <div style={styles.rightPane}>
        {problem ? (
          <>
            <ProblemPanel problem={problem} />
            <hr style={{ border: "none", borderTop: "1px solid #3e3e42" }} />
            <ResultPanel
              runResult={runResult}
              compileError={compileError}
              hint={hint}
              hintLoading={hintLoading}
              onAskCoach={handleAskCoach}
            />
          </>
        ) : (
          <div style={{ color: "#555", fontSize: 13 }}>Select a problem to start.</div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
