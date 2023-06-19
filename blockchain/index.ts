import * as dotenv from 'dotenv';
import bodyParser from "body-parser";
import express from "express";
import cron from 'node-cron';

import { Blockchain, SignTransaction } from "./blockchain";
import { MerkleTree } from "./merkle";
import { Block } from '@prisma/client';

dotenv.config();

const PORT = process.env.PORT;
const blockchain = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

cron.schedule('* * * * *', async () => {
  if (!blockchain.pendingTransactions.length) return;
  const lastBlock = await blockchain.getLastBlock();
  if (!lastBlock) throw { error: "There is no blocks on blockchain" };
  const previousBlockHash = lastBlock.hash;
  const tree = MerkleTree.create(blockchain.pendingTransactions);
  const currentBlockData = { transactions: tree.leafs, rootHash: tree.root.value, index: lastBlock.index + 1 };
  const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);

  const newBlock = await blockchain.createNewBlock(nonce, previousBlockHash, blockHash, tree.leafs, tree.root.value);
  const promises = blockchain.networkNodes.map(networkNode => {
    return fetch(`${networkNode}/receive-new-block`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block: newBlock })
    })
  });

  Promise
    .all(promises)
    .then(_ => console.log({ note: "New block mined successfully", block: newBlock }))
})

app.get('/chain', async (req, res) => {
  const chain = await blockchain.chain();
  res.send({ chain, pendingTransactions: blockchain.pendingTransactions });
});

app.get('/transaction/verify/:index/:hash', async (req, res) => {
  const { index, hash } = req.params;
  if (!index || !hash) return res.status(400).json({ error: "Missing block index or file hash" });

  const block = await blockchain.getBlockAtIndex(Number(index));
  if (!block) return res.status(400).json({ error: `Block at index ${index} was not found` })
  if (!block.transactions?.length) return res.status(200).json({ valid: false });

  const transaction = blockchain.createNewTransaction(hash);
  const tree = MerkleTree.create(block.transactions);
  const isValid = tree.verify(transaction);
  return res.status(200).json({ valid: isValid });
});

app.post('/transaction', async (req, res) => {
  const { transaction } = req.body;
  if (!transaction) return res.status(403).json({ error: "Missing required transaction object" });

  const index = await blockchain.addNewTransaction(transaction);
  res.json({ note: `Transaction will be added in block ${index}` });
});

app.post('/transaction/broadcast', async (req, res) => {
  const { fileHash } = req.body;
  if (!fileHash) return res.status(403).json({ error: "Missing required information" });

  const newTransaction = blockchain.createNewTransaction(fileHash);

  const index = await blockchain.addNewTransaction(newTransaction);

  const promises = blockchain.networkNodes.map(networkNode => {
    return fetch(`${networkNode}/transaction`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transaction: newTransaction })
    })
  })

  Promise
    .all(promises)
    .then(_ => res.json({ note: 'Transaction created and broadcasted successfully.', fileHash, block: index }));
})

app.post('/receive-new-block', async (req, res) => {
  const { block } = req.body;
  if (!block) return res.status(403).json({ error: "Missing required block object" });

  const lastBlock = await blockchain.getLastBlock();
  if (!lastBlock) return res.status(403).json({ error: "There is no block on blockchain" });

  const isPreviousBlockHashedCorrectly = lastBlock.hash === block.previousBlockHash;
  const isNewBlockPlaceOnTheCorrectIndex = lastBlock.index + 1 === block.index;

  if (!isPreviousBlockHashedCorrectly || !isNewBlockPlaceOnTheCorrectIndex) return res.status(403).json({ error: "The block is invalid and therefore rejected" });
  await blockchain.addNewBlock(block);
  res.json({ note: 'New block received and accepted ', block: block })
});

app.post('/register-and-broadcast-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  blockchain.addNetworkNode(newNodeUrl);

  const promises = blockchain.networkNodes.map(networkNode => {
    return fetch(`${networkNode}/register-node`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newNodeUrl: newNodeUrl })
    })
  })

  Promise
    .all(promises)
    .then(_ => {
      return fetch(`${newNodeUrl}/register-multiple-nodes`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allNetworkNodes: [...blockchain.networkNodes, blockchain.urlAddress] })
      })
    })
    .then(_ => {
      res.json({ note: 'New Node registered with network successfully' });
    });
})

app.post('/register-node', (req, res) => {
  const { newNodeUrl } = req.body;
  blockchain.addNetworkNode(newNodeUrl);
  res.json({ note: 'New node registered successfully.' });
})

app.post('/register-multiple-nodes', (req, res) => {
  const { allNetworkNodes } = req.body;
  (allNetworkNodes as string[]).forEach(networkNodeUrl => {
    blockchain.addNetworkNode(networkNodeUrl);
  })
  res.json({ note: 'Multiple nodes registrated successfully.' });
})

app.get('/consensus', (req, res) => {
  // implements the longest chain consensus algorithm
  const promises = blockchain.networkNodes.map(networkNodeUrl => {
    return fetch(`${networkNodeUrl}/chain`)
  });

  Promise
    .all(promises)
    .then(async responses => {
      const currentNodeChain = { chain: await blockchain.chain(), pendingTransactions: blockchain.pendingTransactions };
      const otherNodesBlockchains = await Promise.all(responses.map(response => response.json()) as unknown as Array<{ chain: Block[], pendingTransactions: SignTransaction[] }>);
      const maxLengthBlockchain = otherNodesBlockchains.reduce((maxLengthChain, currentChain) => currentChain.chain.length > maxLengthChain.chain.length ? currentChain : maxLengthChain, currentNodeChain)

      if (maxLengthBlockchain.chain.length === blockchain.chain.length || !blockchain.chainIsValid(maxLengthBlockchain.chain))
        return res.json({
          note: 'Current chain has not been replaced.',
          chain: blockchain.chain
        });

      blockchain.replaceWholeChain(maxLengthBlockchain.chain);
      blockchain.pendingTransactions = maxLengthBlockchain.pendingTransactions;
      res.json({
        note: 'This chain has been replaced.',
        chain: blockchain.chain
      });
    })
})

app.get('/network-acknowledge', (req, res) => {
  return res.json({
    networkNodes: blockchain.networkNodes
  })
})

app.listen(PORT, () => console.log(`Listening on ${process.env.RAILWAY_STATIC_URL} on port ${PORT}...`));