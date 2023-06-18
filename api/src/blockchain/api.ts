import fetch from "node-fetch";
import { sha256 } from "../helpers/utils";

export const createTransactionOnBlockchain = async (fileBuffer: Buffer): Promise<{ fileHash: string, block: number }> => {
  if (!process.env.BLOCKCHAIN_ORIGIN_NODE) throw { message: 'Não foi encontrado o endereço de acesso à blockchain' };
  const fileHash = sha256(fileBuffer);

  return fetch(`${process.env.BLOCKCHAIN_ORIGIN_NODE}/transaction/broadcast`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileHash })
  }).then(res => res.json()).catch(err => {
    console.error(err);
    throw { message: 'O documento foi assinado, mas ocorreu um erro ao enviar a transação para a blockchain. Tentaremos novamente mais tarde.' };
  })
}

export const verifyDocumentOnBlockchain = async (fileHash: string, block: number): Promise<boolean> => {
  if (!process.env.BLOCKCHAIN_ORIGIN_NODE) throw { error: 'As assinaturas são válidas, mas não foi possível validar o documento na blockchain. Não foi encontrado o endereço de acesso à blockchain' };

  return fetch(`${process.env.BLOCKCHAIN_ORIGIN_NODE}/transaction/verify/${block}/${fileHash}`).then(res => res.json()).then(data => data.valid).catch(err => {
    console.error(err);
    throw { error: 'As assinaturas são válidas, mas ocorreu um erro ao tentar validar o documento na blockchain' };
  })
}