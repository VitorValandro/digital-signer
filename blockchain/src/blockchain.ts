import { createHash } from "crypto";

import { Block } from "@prisma/client";
import { prisma } from "../prisma-client";

export type BlockData = {
  rootHash: string;
  transactions: string[];
  index: number;
}

/**
 * Representa uma transação na blockchain
 * 
 * A transação representa um documento assinado
 */
export class SignTransaction {
  public readonly fileHash: string;

  constructor(fileHash: string) {
    this.fileHash = fileHash;
  }
}

/**
 * É a API para acessar e manipular a blockchain
 * @property pendingTransactions - Transações pendentes que ainda não estão em um bloco
 * @property hashAlgorithm - Algoritmo usado para o hashing
 * @property _networkNodes - Um array com os endereços de todos os nós conectados ao nó atual
 * @property urlAddress - O endereço de acesso para o nó atual
 */
export class Blockchain {
  public pendingTransactions: Array<SignTransaction>;
  private hashAlgorithm = 'sha256';
  private readonly _networkNodes: Array<string>;
  public readonly urlAddress = process.env.RAILWAY_STATIC_URL;

  constructor() {
    this.pendingTransactions = [];
    this._networkNodes = [];
  }

  /** Retorna a lista de nós que estão conectados ao nó atual */
  public get networkNodes() {
    return this._networkNodes;
  }

  /** 
   * Registra o endereço de um novo nó na lista de nós conectados ao nó atual
   * @param newNodeUrl - URL de acesso ao novo nó
  */
  public addNetworkNode(newNodeUrl: string) {
    if (newNodeUrl === this.urlAddress) return;
    const alreadyExists = this._networkNodes.find(nodeUrl => nodeUrl === newNodeUrl);
    if (alreadyExists) return;
    this._networkNodes.push(newNodeUrl);
  }

  /**
   * Retorna a corrente de blocos atual
   * @returns Block[]
   */
  public async chain(): Promise<Block[]> {
    return prisma.block.findMany();
  }

  /**
   * Cria um novo bloco e adiciona ele à blockchain
   * @param nonce - Número produzido pela ProofOfWork feita para gerar o bloco
   * @param previousBlockHash - Hash do bloco anterior
   * @param hash - Hash do bloco atual
   * @param transactions - Array dos hashes das transações que irão para esse bloco
   * @param rootHash - Hash da raiz da árvore Merkle das transações
   */
  public async createNewBlock(nonce: number, previousBlockHash: string, hash: string, transactions: string[], rootHash: string): Promise<Block> {
    const chainLength = await prisma.block.count();
    const newBlock = { index: chainLength + 1, timestamp: new Date(), transactions, rootHash, nonce, hash, previousBlockHash };
    await this.addNewBlock(newBlock);
    return newBlock;
  }

  /**
   * Zera as transações pendentes e adiciona um novo bloco na blockchain
   * @param block - Objeto do tipo bloco que será adicionado
   */
  public async addNewBlock(block: Block) {
    if (!block) return;
    this.pendingTransactions = [];
    await this.persistNewBlock(block);
  }

  /**
   * Cria uma nova transação
   * @returns Uma instância da classe SignTransaction
   */
  public createNewTransaction(fileHash: string): SignTransaction {
    return new SignTransaction(fileHash);
  }

  /**
   * Adiciona a transação para as transações pendentes da blockchain
   * @returns O índice do bloco ao qual a transação será adicionada
   */
  public async addNewTransaction(transaction: SignTransaction): Promise<number> {
    this.pendingTransactions.push(transaction);
    return await prisma.block.count() + 1;
  }

  /**
   * Faz o hash dos dados do bloco
   * @param previousBlockHash - Hash do bloco anterior
   * @param currentBlockData - Dados do bloco que será criado
   * @param nonce - Número produzido pela ProofOfWork feita para gerar o bloco
   * @returns O hash desse bloco
   */
  public hashBlock(previousBlockHash: string, currentBlockData: BlockData, nonce: number) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = createHash(this.hashAlgorithm).update(dataAsString).digest('hex');
    return hash;
  }

  /**
   * Executa o PoF do novo bloco que será adicionado
   * @param previousBlockHash - Hash do bloco anterior
   * @param currentBlockData - Hash do bloco atual
   * @returns Número de tentativas feitas até encontrar o hash desejado (nonce)
   */
  public proofOfWork(previousBlockHash: string, currentBlockData: BlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
  }

  /**
   * Verifica se uma corrente de blocos é válida
   * @param chain - Um array de blocos
   * @returns Um booleano que indica se é válida ou não
   */
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

  /**
   * Busca um bloco em um determinado índice
   * @param index - índice ao qual procurar o bloco
   * @returns Caso exista, o bloco. Em caso contrário retorna nulo
   */
  public async getBlockAtIndex(index: number) {
    const block = await prisma.block.findUnique({
      where: {
        index: index
      }
    });
    return block;
  }

  /**
   * Busca o último bloco da corrente
   * @returns Caso exista, o bloco. Em caso contrário retorna nulo
   */
  public async getLastBlock(): Promise<Block | null> {
    const latestBlock = await prisma.block.findFirst({
      orderBy: {
        index: 'desc'
      }
    });

    return latestBlock;
  }

  /**
   * Exclui toda a corrente atual e substitui por outra
   * @param chain - O array de blocos que substituirá a corrente atual
   */
  public replaceWholeChain(chain: Block[]) {
    prisma.block.deleteMany();
    prisma.block.createMany({
      data: [
        ...chain
      ]
    });
  }

  /**
   * Salva um novo bloco na blockchain
   * @param block - Recebe o bloco a ser salvo
   * @returns - Retorna o bloco que foi salvo
   */
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