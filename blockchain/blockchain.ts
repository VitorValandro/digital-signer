import { createHash } from "crypto";
import fs, { readFileSync } from 'fs';

export type BlockData = {
  rootHash: string;
  transactions: string[];
  index: number;
}

export class SignTransaction {
  public readonly fileHash: string;

  constructor(fileHash: string) {
    this.fileHash = fileHash;
  }
}

export class Block {
  public readonly index: number;
  public readonly timestamp: number;
  public readonly transactions: string[];
  public readonly rootHash: string;
  public readonly nonce: number;
  public readonly hash: string;
  public readonly previousBlockHash: string;

  constructor(index: number, transactions: string[], rootHash: string, nonce: number, hash: string, previousBlockHash: string) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.rootHash = rootHash;
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
  public readonly urlAddress = process.env.RAILWAY_STATIC_URL;

  constructor() {
    this.chain = this.loadChain();
    this.pendingTransactions = [];
    this._networkNodes = [];
  }

  createNewBlock(nonce: number, previousBlockHash: string, hash: string, transactions: string[], rootHash: string): Block {
    const newBlock = new Block(this.chain.length + 1, transactions, rootHash, nonce, hash, previousBlockHash);
    this.addNewBlock(newBlock);

    return newBlock;
  }

  addNewBlock(block: Block) {
    if (!block) return;
    this.pendingTransactions = [];
    this.chain.push(block);
    this.persistNewBlock(block);
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(fileHash: string): SignTransaction {
    return new SignTransaction(fileHash);
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

      const blockHash = this.hashBlock(previousBlock.hash, { transactions: currentBlock.transactions, rootHash: currentBlock.rootHash, index: currentBlock.index }, currentBlock.nonce);
      if (blockHash.substring(0, 4) !== '0000') return false;
    }

    return true;
  }

  getBlockAtIndex(index: number) {
    return this.chain[index - 1];
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

  private loadChain() {
    try {
      const data = readFileSync('chain.json', 'utf-8');
      return JSON.parse(data);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
      const GENESIS_CHAIN = [
        {
          "index": 1,
          "timestamp": 0,
          "transactions": [],
          "rootHash": "0",
          "nonce": 100,
          "hash": "0",
          "previousBlockHash": "0"
        }
      ];

      const json = JSON.stringify(GENESIS_CHAIN);
      fs.writeFile('chain.json', json, 'utf8', (err) => {
        if (err) console.error('Error when creating chain.json file: ', err);
      });
    }
  }

  private persistNewBlock(block: Block) {
    fs.readFile('chain.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const chain = JSON.parse(data);
        chain.push(block);
        const appendedJson = JSON.stringify(chain);
        fs.writeFile('chain.json', appendedJson, 'utf8', (err) => {
          if (err) console.error(err);
        });
      }
    });
  }
}