/**
 * Solution: Validate Binary Search Tree (bst-001)
 *
 * Approach: Recursive validation with range tracking
 * Time Complexity: O(n) - visit each node once
 * Space Complexity: O(h) - recursion stack, h = height of tree
 */

import type { TreeNode } from "../../types/tree.ts";

type Input = { root: TreeNode | null };
type Output = boolean;

export const solution = (input: Input): Output => {
	const validate = (
		node: TreeNode | null,
		min: number,
		max: number,
	): boolean => {
		if (node === null) return true;

		// Current node must be within valid range
		if (node.val <= min || node.val >= max) return false;

		// Left subtree: all values must be less than current node
		// Right subtree: all values must be greater than current node
		return (
			validate(node.left, min, node.val) && validate(node.right, node.val, max)
		);
	};

	return validate(input.root, -Infinity, Infinity);
};

/**
 * Key Insights:
 * 1. A valid BST requires ALL nodes in left subtree to be less than root,
 *    not just the immediate left child
 * 2. Pass down valid range (min, max) to each recursive call
 * 3. For left child: update max to current node's value
 * 4. For right child: update min to current node's value
 *
 * Common Mistakes:
 * - Only checking immediate children, not entire subtrees
 * - Not handling equal values (BST typically requires strict inequality)
 */
