import type { Problem, ProblemResult, SuiteResult } from "../types/problem.ts";

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (a === null || b === null) return a === b;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((item, index) => deepEqual(item, b[index]));
	}

	if (typeof a === "object" && typeof b === "object") {
		const aObj = a as Record<string, unknown>;
		const bObj = b as Record<string, unknown>;
		const aKeys = Object.keys(aObj);
		const bKeys = Object.keys(bObj);
		if (aKeys.length !== bKeys.length) return false;
		return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
	}

	return false;
}

export function runProblem<TInput, TOutput>(
	problem: Problem<TInput, TOutput>,
): ProblemResult {
	const failures: ProblemResult["failures"] = [];
	let passed = 0;

	for (let i = 0; i < problem.testCases.length; i++) {
		const testCase = problem.testCases[i];
		if (!testCase) continue;
		try {
			const result = problem.solution(testCase.input);
			if (deepEqual(result, testCase.expected)) {
				passed++;
			} else {
				failures.push({
					testCase: i + 1,
					description: testCase.description,
					expected: testCase.expected,
					received: result,
				});
			}
		} catch (error) {
			failures.push({
				testCase: i + 1,
				description: testCase.description,
				expected: testCase.expected,
				received: `Error: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	return {
		problemId: problem.id,
		title: problem.title,
		passed,
		failed: failures.length,
		total: problem.testCases.length,
		failures,
	};
}

export function runSuite(problems: Problem<unknown, unknown>[]): SuiteResult {
	const results: ProblemResult[] = [];
	let passedProblems = 0;

	for (const problem of problems) {
		const result = runProblem(problem);
		results.push(result);
		if (result.failed === 0) {
			passedProblems++;
		}
	}

	return {
		totalProblems: problems.length,
		passedProblems,
		failedProblems: problems.length - passedProblems,
		results,
	};
}

export function formatProblemResult(result: ProblemResult): string {
	const status = result.failed === 0 ? "✓ PASSED" : "✗ FAILED";
	const lines: string[] = [
		`\n${"=".repeat(60)}`,
		`${status} | ${result.title} (${result.problemId})`,
		`${"=".repeat(60)}`,
		`Tests: ${result.passed}/${result.total} passed`,
	];

	if (result.failures.length > 0) {
		lines.push("\nFailed test cases:");
		for (const failure of result.failures) {
			lines.push(
				`\n  Test #${failure.testCase}${failure.description ? ` - ${failure.description}` : ""}`,
			);
			lines.push(`    Expected: ${JSON.stringify(failure.expected)}`);
			lines.push(`    Received: ${JSON.stringify(failure.received)}`);
		}
	}

	return lines.join("\n");
}

export function formatSuiteResult(result: SuiteResult): string {
	const lines: string[] = [];

	for (const problemResult of result.results) {
		lines.push(formatProblemResult(problemResult));
	}

	lines.push(`\n${"=".repeat(60)}`);
	lines.push("SUITE SUMMARY");
	lines.push(`${"=".repeat(60)}`);
	lines.push(
		`Problems: ${result.passedProblems}/${result.totalProblems} passed`,
	);

	if (result.failedProblems > 0) {
		lines.push("\nFailed problems:");
		for (const problemResult of result.results) {
			if (problemResult.failed > 0) {
				lines.push(`  - ${problemResult.title} (${problemResult.problemId})`);
			}
		}
	}

	return lines.join("\n");
}
