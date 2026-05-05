import { TreeNode } from "../../types/tree.ts";

type Input = { root: TreeNode | null };
type Output = boolean;

function validate(node: TreeNode | null, min: number, max: number): boolean {
  if (node === null) return true;
  if (node.val <= min || node.val >= max) return false;
  return validate(node.left, min, node.val) && validate(node.right, node.val, max);
}

export const solution = (input: Input): Output => {
  return validate(input.root, -Infinity, Infinity);
};
