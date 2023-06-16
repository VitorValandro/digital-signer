import { sha256 } from "../helpers/utils";

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

export const verifyDocumentOnBlockchain = async (fileHash: string, block: number): Promise<boolean> => {
  if (!process.env.BLOCKCHAIN_ORIGIN_NODE) throw { error: 'Não foi encontrado o endereço de acesso à blockchain' };

  return fetch(`${process.env.BLOCKCHAIN_ORIGIN_NODE}/transaction/verify/${block}/${fileHash}`).then(res => res.json()).then(data => data.valid).catch(err => {
    console.error(err);
    throw { error: 'Ocorreu um erro ao tentar validar o documento na blockchain' };
  })
}