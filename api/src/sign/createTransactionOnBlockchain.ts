import { BinaryLike, createHash } from "crypto";

const sha256 = (data: BinaryLike) => {
  return createHash('sha256')
    .update(data)
    .digest()
    .toString('hex');
};

export const createTransactionOnBlockchain = async (fileBuffer: Buffer) => {
  if (!process.env.BLOCKCHAIN_ORIGIN_NODE) throw 'Não foi encontrado o endereço de acesso à blockchain';
  const fileHash = sha256(fileBuffer);
  console.log(`FILE HASH: ${fileHash}`);

  try {
    const response = await fetch(`${process.env.BLOCKCHAIN_ORIGIN_NODE}/transaction/broadcast`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileHash })
    }).then(res => res.json());
    return response;
  } catch (err) {
    console.error(err);
    throw 'Ocorreu um erro ao enviar a transação para a blockchain';
  }
}