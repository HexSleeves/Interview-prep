import { TreeNode } from "../../types/tree.ts";
import type { SolutionVariant } from "../../types/problem.ts";

type Input = { root: TreeNode | null };
type Output = boolean;

const bruteForceSolution = (input: Input): Output => {
  const values: number[] = [];
  const inorder = (node: TreeNode | null): void => {
    if (!node) return;
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  };

  inorder(input.root);

  for (let i = 1; i < values.length; i++) {
    if (values[i - 1]! >= values[i]!) return false;
  }

  return true;
};

export const referenceSolution = (input: Input): Output => {
  const validate = (node: TreeNode | null, min: number, max: number): boolean => {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
  };

  return validate(input.root, -Infinity, Infinity);
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Inorder List Check",
    description: "Build the inorder traversal list and verify it is strictly increasing.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Recursive Bounds",
    description: "Carry min and max bounds down the tree while traversing once.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    implementation: referenceSolution,
  },
];
