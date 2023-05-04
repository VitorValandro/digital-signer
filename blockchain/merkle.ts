import { SignTransaction } from "./blockchain";
import { BinaryLike, createHash } from "crypto";

export const sha256 = (data: BinaryLike) => {
  return createHash('sha256')
    .update(data)
    .digest()
    .toString('hex');
};

class MerkleNode {
  public readonly value: string;
  public readonly left: MerkleNode | null;
  public readonly right: MerkleNode | null;

  constructor(value: string, left: MerkleNode | null = null, right: MerkleNode | null = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

export class MerkleTree {
  public readonly root: MerkleNode;
  public readonly leafs: string[];
  public readonly size: number;

  constructor(root: MerkleNode, leafs: string[], size: number) {
    this.root = root;
    this.size = size;
    this.leafs = leafs;
  }

  static create(transactions: SignTransaction[]) {
    if (!transactions.length) throw Error('Transactions array cant be null');
    const size = Math.ceil(Math.log2(transactions.length)) + 1;
    const leafs = transactions.map(t => sha256(JSON.stringify(t)));
    const hashedTransactions = leafs.map(leaf => new MerkleNode(leaf));
    const root = this.makeRoot(hashedTransactions);

    return new MerkleTree(root, leafs, size);
  }

  private static makeRoot(hashedNodes: MerkleNode[]): MerkleNode {
    if (hashedNodes.length === 1) return hashedNodes[0];
    const sublist = [];

    for (let i = 0; i < hashedNodes.length; i += 2) {
      const leftNode = hashedNodes[i];
      if (i + 1 >= hashedNodes.length) {
        sublist.push(leftNode);
        break;
      }
      const rightNode = hashedNodes[i + 1];
      const value = leftNode.value + rightNode.value;
      const node = new MerkleNode(sha256(value), leftNode, rightNode);
      sublist.push(node);
    }
    return this.makeRoot(sublist);
  }

  private getSiblingOf(hash: string, node: MerkleNode | null = this.root): { node: MerkleNode | null, left?: boolean } | null {
    if (!node?.value) return null;
    if (node.value === hash) return { node };
    if (!node.left && !node.right) return null;
    if (node.left?.value === hash) return { node: node.right, left: false };
    if (node.right?.value === hash) return { node: node.left, left: true };
    return (this.getSiblingOf(hash, node.left) || this.getSiblingOf(hash, node.right));
  }

  public verify(data: SignTransaction) {
    let hash = sha256(JSON.stringify(data));
    let sibling = this.getSiblingOf(hash);

    while (sibling && sibling.node !== null && sibling.node.value !== this.root.value) {
      const concatenatedHash = sibling.left
        ? sibling.node.value + hash
        : hash + sibling.node.value;

      hash = sha256(concatenatedHash);
      sibling = this.getSiblingOf(hash);
    }

    return sibling && sibling.node && sibling.node.value === this.root.value ? true : false;
  }
}