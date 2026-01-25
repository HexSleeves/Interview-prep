export class TreeNode<T = number> {
	val: T;
	left: TreeNode<T> | null;
	right: TreeNode<T> | null;

	constructor(
		val: T,
		left: TreeNode<T> | null = null,
		right: TreeNode<T> | null = null,
	) {
		this.val = val;
		this.left = left;
		this.right = right;
	}
}

export function arrayToBST(arr: (number | null)[]): TreeNode | null {
	if (arr.length === 0) return null;
	const rootVal = arr[0];
	if (rootVal === null || rootVal === undefined) return null;

	const root = new TreeNode(rootVal);
	const queue: (TreeNode | null)[] = [root];
	let i = 1;

	while (queue.length > 0 && i < arr.length) {
		const node = queue.shift();
		if (node === null || node === undefined) continue;

		if (i < arr.length) {
			const leftVal = arr[i++];
			if (leftVal !== null && leftVal !== undefined) {
				node.left = new TreeNode(leftVal);
				queue.push(node.left);
			} else {
				queue.push(null);
			}
		}

		if (i < arr.length) {
			const rightVal = arr[i++];
			if (rightVal !== null && rightVal !== undefined) {
				node.right = new TreeNode(rightVal);
				queue.push(node.right);
			} else {
				queue.push(null);
			}
		}
	}

	return root;
}

export function bstToArray(root: TreeNode | null): (number | null)[] {
	if (!root) return [];

	const result: (number | null)[] = [];
	const queue: (TreeNode | null)[] = [root];

	while (queue.length > 0) {
		const node = queue.shift();
		if (node === null || node === undefined) {
			result.push(null);
		} else {
			result.push(node.val);
			queue.push(node.left);
			queue.push(node.right);
		}
	}

	while (result.length > 0 && result[result.length - 1] === null) {
		result.pop();
	}

	return result;
}
