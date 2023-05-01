import { v4 as uuid } from 'uuid';
import { createHash } from "crypto";

export type BlockData = {
  transactions: SignTransaction[];
  index: number;
}

export class SignTransaction {
  public readonly name: string;
  public readonly signer: string;
  public readonly fileHash: string;
  private readonly transactionId: string;

  constructor(name: string, signer: string, fileHash: string) {
    this.name = name;
    this.signer = signer;
    this.fileHash = fileHash;
    this.transactionId = uuid().split('-').join('-');
  }
}

export class Block {
  public readonly index: number;
  public readonly timestamp: number;
  public readonly transactions: Array<SignTransaction>;
  public readonly nonce: number;
  public readonly hash: string;
  public readonly previousBlockHash: string;

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
  public chain: Array<Block>;
  public pendingTransactions: Array<SignTransaction>;
  private hashAlgorithm = 'sha256';
  private readonly _networkNodes: Array<string>;
  public readonly urlAddress = `http://localhost:${process.argv[2]}`;

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

  chainIsValid(chain: Array<Block>) {
    const genesisBlock = chain[0];
    if (genesisBlock.nonce !== 100) return false;
    if (genesisBlock.previousBlockHash !== '0') return false;
    if (genesisBlock.hash !== '0') return false;
    if (genesisBlock.transactions.length !== 0) return false;

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.previousBlockHash !== previousBlock.hash) return false;

      const blockHash = this.hashBlock(previousBlock.hash, { transactions: currentBlock.transactions, index: currentBlock.index }, currentBlock.nonce);
      if (blockHash.substring(0, 4) !== '0000') return false;
    }

    return true;
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