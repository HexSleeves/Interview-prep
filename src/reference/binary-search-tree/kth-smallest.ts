import { TreeNode } from "../../types/tree.ts";

type Input = { root: TreeNode | null; k: number };
type Output = number;

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
