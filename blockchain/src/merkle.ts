import { SignTransaction } from "./blockchain";
import { BinaryLike, createHash } from "crypto";

/**
 * Função que recebe um dado e retorna um hash produzido pelo algoritmo sha256
 * @param data - Dado que será hasheado
 * @returns O hash do dado
 */
export const sha256 = (data: BinaryLike) => {
  return createHash('sha256')
    .update(data)
    .digest()
    .toString('hex');
};

/**
 * Classe auxiliar que representa um nó da árvore Merkle
 */
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

/**
 * Classe que representa a árvore Merkle
 */
export class MerkleTree {
  public readonly root: MerkleNode;
  public readonly leafs: string[];
  public readonly size: number;

  constructor(root: MerkleNode, leafs: string[], size?: number) {
    this.root = root;
    this.size = size || Math.ceil(Math.log2(leafs.length)) + 1;
    this.leafs = leafs;
  }

  /** Cria a árvore a partir de um array de transações */
  static create(transactions: SignTransaction[] | string[]) {
    if (!transactions.length) throw Error('Transactions array cant be null');

    let leafs: string[];
    if (transactions[0] instanceof SignTransaction) leafs = transactions.map(t => sha256(JSON.stringify(t)));
    else leafs = transactions as string[];
    const size = Math.ceil(Math.log2(transactions.length)) + 1;
    const hashedTransactions = leafs.map(leaf => new MerkleNode(leaf));
    const root = this.makeRoot(hashedTransactions);

    return new MerkleTree(root, leafs, size);
  }

  /**
   * Constrói a árvore de baixo pra cima, a partir das folhas até a raiz
   * @returns A raiz da árvore
   */
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

  /**
   * Pega o irmão do nó atual
   */
  private getSiblingOf(hash: string, node: MerkleNode | null = this.root): { node: MerkleNode | null, left?: boolean } | null {
    if (!node?.value) return null;
    if (node.value === hash) return { node };
    if (!node.left && !node.right) return null;
    if (node.left?.value === hash) return { node: node.right, left: false };
    if (node.right?.value === hash) return { node: node.left, left: true };
    return (this.getSiblingOf(hash, node.left) || this.getSiblingOf(hash, node.right));
  }

  /**
   * Verifica se uma transação faz parte da árvore através do hash dos dados
   */
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