import { v4 as uuid } from 'uuid';
import { createHash } from "crypto";

export type BlockData = {
  transactions: SignTransaction[];
  index: number;
}

export class SignTransaction {
  public name: string;
  public signer: string;
  public fileHash: string;
  private transactionId: string;

  constructor(name: string, signer: string, fileHash: string) {
    this.name = name;
    this.signer = signer;
    this.fileHash = fileHash;
    this.transactionId = uuid().split('-').join('-');
  }
}

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Array<SignTransaction>;
  private nonce: number;
  public hash: string;
  private previousBlockHash: string;

  constructor(index: number, transactions: SignTransaction[], nonce: number, hash: string, previousBlockHash: string) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = hash;
    this.previousBlockHash = previousBlockHash;
  }
}

export class Blockchain {
  private chain: Array<Block>;
  public pendingTransactions: Array<SignTransaction>;
  private hashAlgorithm = 'sha256';
  private _networkNodes: Array<string>;
  public urlAddress = `http://localhost:${process.argv[2]}`;

  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock(100, '0', '0');
    this._networkNodes = [];
  }

  createNewBlock(nonce: number, previousBlockHash: string, hash: string): Block {
    const newBlock = new Block(this.chain.length + 1, this.pendingTransactions, nonce, hash, previousBlockHash);
    this.addNewBlock(newBlock);

    return newBlock;
  }

  addNewBlock(block: Block) {
    if (!block) return;
    this.pendingTransactions = [];
    this.chain.push(block);
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(name: string, signer: string, fileHash: string): SignTransaction {
    return new SignTransaction(name, signer, fileHash);
  }

  addNewTransaction(transaction: SignTransaction): number {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock().index + 1;
  }

  hashBlock(previousBlockHash: string, currentBlockData: BlockData, nonce: number) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = createHash(this.hashAlgorithm).update(dataAsString).digest('hex');
    return hash;
  }

  proofOfWork(previousBlockHash: string, currentBlockData: BlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
  }

  addNetworkNode(newNodeUrl: string) {
    if (newNodeUrl === this.urlAddress) return;
    const alreadyExists = this._networkNodes.find(nodeUrl => nodeUrl === newNodeUrl);
    if (alreadyExists) return;
    this._networkNodes.push(newNodeUrl);
  }

  get networkNodes() {
    return this._networkNodes;
  }
}