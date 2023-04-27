import bodyParser from "body-parser";
import express from "express";
import { Blockchain } from "./blockchain";

const blockchain = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', (req, res) => {
  res.send(blockchain);
});

app.post('/transaction', (req, res) => {
  console.log('alo')
  const { name, signer, fileHash } = req.body;
  if (!name || !signer || !fileHash) return res.status(403).json({ error: "Missing required information" });

  const index = blockchain.createNewTransaction(name, signer, fileHash);
  res.json({ note: `Transaction will be added in block ${index}`});
});

app.get('/mine', (req, res) => {
  const lastBlock = blockchain.getLastBlock();
  const previousBlockHash = lastBlock.hash;
  const currentBlockData = { transactions: blockchain.pendingTransactions, index: lastBlock.index + 1 };
  const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);

  const newBlock = blockchain.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    note: "New block mined successfully",
    block: newBlock
   });
});

app.listen(3000, () => console.log('Listening on port 3000...'));