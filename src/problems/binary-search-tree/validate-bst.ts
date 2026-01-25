import type { Problem } from "../../types/problem.ts";
import { type TreeNode, arrayToBST } from "../../types/tree.ts";

type Input = { root: TreeNode | null };
type Output = boolean;

export const solution = (_input: Input): Output => {
	console.log("input", _input);
	// TODO: Implement your solution here
	// Given the root of a binary tree, determine if it is a valid BST.
	// A valid BST has the property that:
	// - The left subtree of a node contains only nodes with keys less than the node's key.
	// - The right subtree of a node contains only nodes with keys greater than the node's key.
	// - Both the left and right subtrees must also be binary search trees.
	throw new Error("Not implemented");
};

// Reference solution (hidden during practice)
const referenceSolution = (input: Input): Output => {
	const validate = (
		node: TreeNode | null,
		min: number,
		max: number,
	): boolean => {
		if (node === null) return true;
		if (node.val <= min || node.val >= max) return false;
		return (
			validate(node.left, min, node.val) && validate(node.right, node.val, max)
		);
	};

	return validate(input.root, -Infinity, Infinity);
};

export const problem: Problem<Input, Output> = {
	id: "bst-001",
	title: "Validate Binary Search Tree",
	description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.

Example 1:
  Input: root = [2,1,3]
  Output: true

Example 2:
  Input: root = [5,1,4,null,null,3,6]
  Output: false
  Explanation: The root node's value is 5 but its right child's value is 4.`,
	difficulty: "medium",
	tags: ["binary-search-tree", "recursion", "dfs"],
	hints: [
		"Think about the constraints that each node must satisfy based on its position in the tree.",
		"Use a recursive approach where you pass down the valid range for each node.",
		"The left subtree of a node must have all values less than the node, and the right subtree must have all values greater.",
	],
	testCases: [
		{
			input: { root: arrayToBST([2, 1, 3]) },
			expected: true,
			description: "Simple valid BST",
		},
		{
			input: { root: arrayToBST([5, 1, 4, null, null, 3, 6]) },
			expected: false,
			description: "Invalid BST - right child less than root",
		},
		{
			input: { root: arrayToBST([1]) },
			expected: true,
			description: "Single node tree",
		},
		{
			input: { root: null },
			expected: true,
			description: "Empty tree",
		},
		{
			input: { root: arrayToBST([5, 4, 6, null, null, 3, 7]) },
			expected: false,
			description: "Invalid BST - deeper violation",
		},
		{
			input: { root: arrayToBST([10, 5, 15, 3, 7, 12, 20]) },
			expected: true,
			description: "Valid larger BST",
		},
	],
	solution: referenceSolution,
};
