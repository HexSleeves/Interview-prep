import { TreeNode } from "../../types/tree.ts";
import type { SolutionVariant } from "../../types/problem.ts";

type Input = { root: TreeNode | null; k: number };
type Output = number;

const bruteForceSolution = (input: Input): Output => {
  const values: number[] = [];
  const visit = (node: TreeNode | null): void => {
    if (!node) return;
    values.push(node.val);
    visit(node.left);
    visit(node.right);
  };

  visit(input.root);
  values.sort((a, b) => a - b);
  return values[input.k - 1] ?? -1;
};

export const referenceSolution = (input: Input): Output => {
  const { root, k } = input;
  const values: number[] = [];

  const inorder = (node: TreeNode | null): void => {
    if (node === null || values.length >= k) return;
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  };

  inorder(root);
  return values[k - 1] ?? -1;
};

export const referenceSolutions: SolutionVariant<Input, Output>[] = [
  {
    id: "brute-force",
    title: "Collect and Sort",
    description: "Collect every node value, sort them, then index into the sorted list.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    implementation: bruteForceSolution,
  },
  {
    id: "optimized",
    title: "Inorder Traversal",
    description: "Use BST inorder ordering and stop after visiting k nodes.",
    timeComplexity: "O(h + k)",
    spaceComplexity: "O(h)",
    implementation: referenceSolution,
  },
];
