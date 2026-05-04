# Interview Prep

A TypeScript coding interview practice harness built with Bun. Problem prompts, learner stubs, and reference solutions are split so the answer key is not sitting next to the file you edit while practicing:

- `src/problems`: prompts, tags, hints, test cases, and custom comparators.
- `src/solutions`: editable learner stubs.
- `src/reference`: known-good implementations used by `check` mode.

## Setup

```bash
bun install
```

## Branch Workflow

Keep `main` as the clean practice harness and answer-key branch. Do not commit your learner implementations to `main`.

Use a dedicated `solutions` branch for solved attempts:

```bash
bun run init:solutions
```

The init script:

- creates `solutions` from `main` or `master` when it does not exist
- switches to `solutions` when it already exists
- tracks `origin/solutions` when that remote branch already exists locally
- refuses to switch away from `main` or another branch if there are uncommitted changes, so practice edits do not leak into the wrong branch

## Practice Workflow

1. List problems:

   ```bash
   bun . list
   ```

2. Read a prompt, hints, or approach summaries:

   ```bash
   bun . show bst-001
   bun . show bst-001 --hints
   bun . show bst-001 --solutions
   ```

3. Open the learner file in `src/solutions/<domain>/`.
4. Implement the exported `solution` function.
5. Run your solution:

   ```bash
   bun . run bst-001
   ```

`run` mode executes the editable `solution`, so it is expected to fail for unsolved problems.

## Validate the Repository

Use `check` mode to run reference solutions:

```bash
bun . check --all
bun . check --domain frequency
bun . check bst-001
bun . check bst-001 --solution optimized
```

Run the full validation suite:

```bash
bun run test
```

`bun run test` runs Bun tests for the harness and then checks every reference solution.

## CLI

```bash
bun . list
bun . list <domain>
bun . show <problem-id>
bun . show <problem-id> --hints
bun . show <problem-id> --solutions
bun . run <problem-id>
bun . run --domain <domain>
bun . run --all
bun . check <problem-id>
bun . check <problem-id> --solution <solution-id>
bun . check --domain <domain>
bun . check --all
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
4. Fill in the `Input`, `Output`, prompt, test cases, hints, learner stub, and reference solutions.
5. Add the problem definition to the domain's `src/problems/<domain>/index.ts`.
6. Wire the problem definition, learner solution, and reference solutions together in `src/registry/<domain>.ts`.
7. Run:

   ```bash
   bun run test
   ```

Use `compareOutput` when multiple valid outputs should be accepted, such as array answers where order does not matter.
