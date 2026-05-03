import { TreeNode } from "../../types/tree.ts";

type Input = { root: TreeNode | null };
type Output = boolean;

export const referenceSolution = (input: Input): Output => {
  const validate = (
    node: TreeNode | null,
    min: number,
    max: number
  ): boolean => {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return (
      validate(node.left, min, node.val) && validate(node.right, node.val, max)
    );
  };

  return validate(input.root, -Infinity, Infinity);
};
