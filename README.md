# Interview Prep

A TypeScript coding interview practice harness built with Bun. Problems are organized by domain and each problem has two implementations:

- `solution`: the editable learner stub you practice in.
- `referenceSolution`: the known-good implementation used to validate the repository.

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

3. Open the problem file in `src/problems/<domain>/`.
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
├── runner/                   # Harness logic and tests
│   ├── index.ts
│   └── index.test.ts
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── problem.ts
│   └── tree.ts
└── problems/                 # Problems organized by domain
    ├── _template.problem.ts
    ├── index.ts
    ├── binary-search-tree/
    ├── frequency/
    ├── prefix-sum/
    └── sliding-window/
```

## Add a Problem

1. Copy `src/problems/_template.problem.ts` into the target domain folder.
2. Fill in the `Input`, `Output`, prompt, test cases, hints, `solution`, and `referenceSolution`.
3. Add the problem to the domain's `index.ts`.
4. Run:

   ```bash
   bun run test
   ```

Use `compareOutput` when multiple valid outputs should be accepted, such as array answers where order does not matter.
