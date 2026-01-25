/**
 * Solution: Kth Smallest Element in a BST (bst-002)
 *
 * Approach: Inorder traversal (visits nodes in ascending order)
 * Time Complexity: O(k) - can stop early after finding kth element
 * Space Complexity: O(h) - recursion stack, h = height of tree
 */

import { TreeNode } from "../../types/tree.ts";

type Input = { root: TreeNode | null; k: number };
type Output = number;

export const solution = (input: Input): Output => {
  const { root, k } = input;
  const values: number[] = [];

  const inorder = (node: TreeNode | null): void => {
    if (node === null || values.length >= k) return;

    // Visit left subtree first (smaller values)
    inorder(node.left);

    // Process current node
    values.push(node.val);

    // Visit right subtree (larger values)
    inorder(node.right);
  };

  inorder(root);
  return values[k - 1] ?? -1;
};

/**
 * Key Insights:
 * 1. Inorder traversal of BST visits nodes in sorted (ascending) order
 * 2. Traversal order: Left -> Root -> Right
 * 3. We can stop early once we've collected k elements
 *
 * Alternative Approaches:
 * - Iterative with stack (avoids recursion overhead)
 * - Morris traversal (O(1) space, but modifies tree temporarily)
 *
 * Follow-up: If the BST is modified often, consider augmenting
 * nodes with subtree size for O(h) queries
 */
