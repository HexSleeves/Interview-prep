# Interview Prep

A TypeScript-based coding interview practice platform built with Bun. Practice problems organized by domain with instant feedback.

## Setup

```bash
# Install dependencies
bun install
```

## Usage

### List all problems
```bash
bun run list
```

### List problems by domain
```bash
bun run cli list binary-search-tree
bun run cli list frequency
bun run cli list prefix-sum
bun run cli list sliding-window
```

### Run a specific problem
```bash
bun run cli run bst-001
bun run cli run freq-001
```

### Run all problems in a domain
```bash
bun run test:bst          # Binary Search Tree problems
bun run test:frequency    # Frequency problems
bun run test:prefix       # Prefix Sum problems
bun run test:window       # Sliding Window problems
```

### Run the full suite
```bash
bun run test
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

## How to Practice

1. Open a problem file in `src/problems/<domain>/`
2. Find the `solution` function with the `// TODO: Implement your solution here`
3. Implement your solution
4. Run the problem to check your work:
   ```bash
   bun run cli run <problem-id>
   ```

## Project Structure

```
src/
├── cli.ts                    # CLI entry point
├── runner/                   # Test runner logic
│   └── index.ts
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── problem.ts
│   └── tree.ts
└── problems/                 # Problems organized by domain
    ├── index.ts
    ├── binary-search-tree/
    ├── frequency/
    ├── prefix-sum/
    └── sliding-window/
```

## Adding New Problems

1. Create a new file in the appropriate domain folder
2. Export a `problem` object conforming to `Problem<TInput, TOutput>`
3. Add the problem to the domain's `index.ts`
4. The problem will automatically be available in the CLI