import bodyParser from "body-parser";
import express from "express";
import { Blockchain } from "./blockchain";

const blockchain = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.argv[2];

app.get('/blockchain', (req, res) => {
  res.send(blockchain);
});

app.post('/transaction', (req, res) => {
  const { transaction } = req.body;
  if (!transaction) return res.status(403).json({ error: "Missing required transaction object" });

  const index = blockchain.addNewTransaction(transaction);
  res.json({ note: `Transaction will be added in block ${index}` });
});

app.post('/transaction/broadcast', (req, res) => {
  const { name, signer, fileHash } = req.body;
  if (!name || !signer || !fileHash) return res.status(403).json({ error: "Missing required information" });

  const newTransaction = blockchain.createNewTransaction(name, signer, fileHash);

  blockchain.addNewTransaction(newTransaction);
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
    .then(_ => res.json({ note: 'Transaction created and broadcast successfully.' }));
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

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));