import type { ProblemDefinition } from "../../types/problem.ts";
import { TreeNode, arrayToBST } from "../../types/tree.ts";

type Input = { root: TreeNode | null; k: number };
type Output = number;

export const problem: ProblemDefinition<Input, Output> = {
  id: "bst-002",
  title: "Kth Smallest Element in a BST",
  description: `Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

Example 1:
  Input: root = [3,1,4,null,2], k = 1
  Output: 1

Example 2:
  Input: root = [5,3,6,2,4,null,null,1], k = 3
  Output: 3

Constraints:
- The number of nodes in the tree is n.
- 1 <= k <= n <= 10^4
- 0 <= Node.val <= 10^4`,
  difficulty: "medium",
  tags: ["binary-search-tree", "inorder-traversal", "dfs"],
  hints: [
    "What traversal of a BST gives you elements in sorted order?",
    "Inorder traversal (left, root, right) visits BST nodes in ascending order.",
    "You can stop early once you've found the kth element.",
  ],
  testCases: [
    {
      input: { root: arrayToBST([3, 1, 4, null, 2]), k: 1 },
      expected: 1,
      description: "k=1, find minimum",
    },
    {
      input: { root: arrayToBST([5, 3, 6, 2, 4, null, null, 1]), k: 3 },
      expected: 3,
      description: "k=3 in larger tree",
    },
    {
      input: { root: arrayToBST([1, null, 2]), k: 2 },
      expected: 2,
      description: "Right-skewed tree",
    },
    {
      input: { root: arrayToBST([2, 1, 3]), k: 2 },
      expected: 2,
      description: "Find middle element",
    },
    {
      input: { root: arrayToBST([10, 5, 15, 3, 7, 12, 20, 1]), k: 5 },
      expected: 10,
      description: "Find root value",
    },
  ],
};
