# Contributing

This repository is a Bun/TypeScript interview practice harness. Problems should be easy for a learner to open, edit, run, and understand from the CLI.

## Add a Problem

1. Copy `src/problems/_template.problem.ts` into the correct domain folder.
2. Replace the sample `Input`, `Output`, prompt, tags, hints, test cases, and reference solution.
3. Keep `solution` as the editable learner stub that throws `new Error("not implemented")`.
4. Keep `referenceSolution` complete and deterministic.
5. Export the problem from the domain `index.ts`.
6. Run `bun run test`.

## Problem Conventions

- IDs use the existing domain prefix style, such as `bst-003`, `freq-003`, `prefix-003`, or `window-003`.
- Difficulty must be `easy`, `medium`, or `hard`.
- Test cases should include the example cases, a small edge case, and at least one case that catches the common brute-force or off-by-one mistake.
- `description` should be self-contained because `bun run cli show <problem-id>` prints it directly.
- Hints should progress from general strategy to a near-solution pointer.

## Custom Comparators

Use `compareOutput` when more than one output order or shape is valid. For example, top-k problems often accept results in any order:

```ts
const compareOutput = (expected: number[], received: number[]): boolean => {
  if (expected.length !== received.length) return false;
  const sortedExpected = [...expected].sort((a, b) => a - b);
  const sortedReceived = [...received].sort((a, b) => a - b);
  return sortedExpected.every((value, index) => value === sortedReceived[index]);
};
```

## Validation

- `bun run cli run <problem-id>` runs the editable learner solution.
- `bun run cli check <problem-id>` runs the reference solution.
- `bun run test` runs harness tests and all reference solutions.
