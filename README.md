# Interview Prep

A TypeScript coding interview practice harness built with Bun. Problem prompts, learner stubs, and reference solutions are split so the answer key is not sitting next to the file you edit while practicing:

- `src/problems`: prompts, tags, hints, test cases, and custom comparators.
- `src/solutions`: editable learner stubs.
- `src/reference`: known-good implementations used by `check` mode.

## Setup

```bash
bun install
```

## Practice Workflow

1. List problems:

   ```bash
   bun run list
   ```

2. Read a prompt:

   ```bash
   bun run cli show bst-001
   bun run cli show bst-001 --hints
   ```

3. Open the learner file in `src/solutions/<domain>/`.
4. Implement the exported `solution` function.
5. Run your solution:

   ```bash
   bun run cli run bst-001
   ```

`run` mode executes the editable `solution`, so it is expected to fail for unsolved problems.

## Validate the Repository

Use `check` mode to run reference solutions:

```bash
bun run cli check --all
bun run cli check --domain frequency
bun run cli check bst-001
```

Run the full validation suite:

```bash
bun run test
```

`bun run test` runs Bun tests for the harness and then checks every reference solution.

## CLI

```bash
bun run cli list
bun run cli list <domain>
bun run cli show <problem-id>
bun run cli show <problem-id> --hints
bun run cli run <problem-id>
bun run cli run --domain <domain>
bun run cli run --all
bun run cli check <problem-id>
bun run cli check --domain <domain>
bun run cli check --all
```

## Problem Domains

### Binary Search Tree

- `bst-001` - Validate Binary Search Tree (medium)
- `bst-002` - Kth Smallest Element in a BST (medium)

### Frequency

- `freq-001` - Top K Frequent Elements (medium)
- `freq-002` - First Unique Character in a String (easy)

### Prefix Sum

- `prefix-001` - Range Sum Query - Immutable (easy)
- `prefix-002` - Subarray Sum Equals K (medium)

### Sliding Window

- `window-001` - Maximum Sum Subarray of Size K (easy)
- `window-002` - Longest Substring Without Repeating Characters (medium)

## Project Structure

```text
src/
├── cli.ts                    # CLI entry point
├── cli.test.ts               # CLI smoke tests
├── registry/                 # Composes prompts, learner stubs, and references
├── runner/                   # Harness logic and tests
│   ├── index.ts
│   └── index.test.ts
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── problem.ts
│   └── tree.ts
├── problems/                 # Prompts, tests, hints, and comparators
│   ├── _template.problem.ts
│   ├── index.ts
│   ├── binary-search-tree/
│   ├── frequency/
│   ├── prefix-sum/
│   └── sliding-window/
├── solutions/                # Editable learner stubs
└── reference/                # Answer key used by check mode
```

## Add a Problem

1. Copy `src/problems/_template.problem.ts` into the target domain folder.
2. Copy `src/solutions/_template.solution.ts` into the matching domain folder.
3. Copy `src/reference/_template.reference.ts` into the matching domain folder.
4. Fill in the `Input`, `Output`, prompt, test cases, hints, learner stub, and reference solution.
5. Add the problem definition to the domain's `src/problems/<domain>/index.ts`.
6. Wire the problem definition, learner solution, and reference solution together in `src/registry/<domain>.ts`.
7. Run:

   ```bash
   bun run test
   ```

Use `compareOutput` when multiple valid outputs should be accepted, such as array answers where order does not matter.
