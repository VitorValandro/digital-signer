import { createHash } from "crypto";

import { Block } from "@prisma/client";
import { prisma } from "./prisma-client";

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

export class Blockchain {
  public pendingTransactions: Array<SignTransaction>;
  private hashAlgorithm = 'sha256';
  private readonly _networkNodes: Array<string>;
  public readonly urlAddress = process.env.RAILWAY_STATIC_URL;

  constructor() {
    this.pendingTransactions = [];
    this._networkNodes = [];
  }

  public get networkNodes() {
    return this._networkNodes;
  }

  public addNetworkNode(newNodeUrl: string) {
    if (newNodeUrl === this.urlAddress) return;
    const alreadyExists = this._networkNodes.find(nodeUrl => nodeUrl === newNodeUrl);
    if (alreadyExists) return;
    this._networkNodes.push(newNodeUrl);
  }

  public async chain(): Promise<Block[]> {
    return prisma.block.findMany();
  }

  public async createNewBlock(nonce: number, previousBlockHash: string, hash: string, transactions: string[], rootHash: string): Promise<Block> {
    const chainLength = await prisma.block.count();
    const newBlock = { index: chainLength + 1, timestamp: new Date(), transactions, rootHash, nonce, hash, previousBlockHash };
    await this.addNewBlock(newBlock);
    return newBlock;
  }

  public async addNewBlock(block: Block) {
    if (!block) return;
    this.pendingTransactions = [];
    await this.persistNewBlock(block);
  }

  public createNewTransaction(fileHash: string): SignTransaction {
    return new SignTransaction(fileHash);
  }

  public async addNewTransaction(transaction: SignTransaction): Promise<number> {
    this.pendingTransactions.push(transaction);
    return await prisma.block.count() + 1;
  }

  public hashBlock(previousBlockHash: string, currentBlockData: BlockData, nonce: number) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = createHash(this.hashAlgorithm).update(dataAsString).digest('hex');
    return hash;
  }

  public proofOfWork(previousBlockHash: string, currentBlockData: BlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
  }

  public chainIsValid(chain: Array<Block>) {
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

  public async getBlockAtIndex(index: number) {
    const block = await prisma.block.findUnique({
      where: {
        index: index
      }
    });
    return block;
  }

  public async getLastBlock(): Promise<Block | null> {
    const latestBlock = await prisma.block.findFirst({
      orderBy: {
        index: 'desc'
      }
    });

    return latestBlock;
  }

  public replaceWholeChain(chain: Block[]) {
    prisma.block.deleteMany();
    prisma.block.createMany({
      data: [
        ...chain
      ]
    });
  }

  private async persistNewBlock(block: Block) {
    return await prisma.block.upsert({
      create: {
        ...block
      },
      where: {
        index: block.index
      },
      update: {}
    })
  }
}