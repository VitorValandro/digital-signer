import { BinaryLike, createHash } from "crypto";

const sha256 = (data: BinaryLike) => {
  return createHash('sha256')
    .update(data)
    .digest()
    .toString('hex');
};

export const createTransactionOnBlockchain = async (fileBuffer: Buffer): Promise<{ fileHash: string, block: number }> => {
  if (!process.env.BLOCKCHAIN_ORIGIN_NODE) throw { message: 'Não foi encontrado o endereço de acesso à blockchain' };
  const fileHash = sha256(fileBuffer);

  try {
    return fetch(`${process.env.BLOCKCHAIN_ORIGIN_NODE}/transaction/broadcast`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileHash })
    }).then(res => res.json())
  } catch (err) {
    console.error(err);
    throw { message: 'Ocorreu um erro ao enviar a transação para a blockchain' };
  }
}