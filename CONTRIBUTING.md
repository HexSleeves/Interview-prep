# Contributing

This repository is a Bun/TypeScript interview practice harness. Problems should be easy for a learner to open, edit, run, and understand from the CLI.

## Add a Problem

1. Copy `src/problems/_template.problem.ts` into the correct domain folder.
2. Copy `src/solutions/_template.solution.ts` into the matching domain folder.
3. Copy `src/reference/_template.reference.ts` into the matching domain folder.
4. Replace the sample `Input`, `Output`, prompt, tags, hints, test cases, learner stub, and reference solutions.
5. Keep the learner `solution` stub in `src/solutions` throwing `new Error("not implemented")`.
6. Keep every `referenceSolutions` variant in `src/reference` complete and deterministic.
7. Export the problem definition from the domain `src/problems/<domain>/index.ts`.
8. Compose the definition, learner solution, and reference solutions in `src/registry/<domain>.ts`.
9. Run `bun run test`.

## Problem Conventions

- IDs use the existing domain prefix style, such as `bst-003`, `freq-003`, `prefix-003`, or `window-003`.
- Difficulty must be `easy`, `medium`, or `hard`.
- Test cases should include the example cases, a small edge case, and at least one case that catches the common brute-force or off-by-one mistake.
- `src/problems` files must not export or import executable solutions.
- `description` should be self-contained because `bun . show <problem-id>` prints it directly.
- Hints should progress from general strategy to a near-solution pointer.
- Reference solution variant IDs should be stable kebab-case labels, such as `brute-force`, `optimized`, or `two-pointer`.
- Include `title`, `description`, `timeComplexity`, and `spaceComplexity` for each reference solution variant so `bun . show <problem-id> --solutions` is useful without exposing source code.

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

- `bun . run <problem-id>` runs the editable learner solution.
- `bun . check <problem-id>` runs every reference solution variant.
- `bun . check <problem-id> --solution optimized` runs one reference solution variant.
- `bun run test` runs harness tests and all reference solutions.
