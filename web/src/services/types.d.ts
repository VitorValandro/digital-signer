export type Document = {
  createdAt: string;
  owner: {
    name: string;
  };
  signatures: {
    isSigned: boolean;
    signedAt?: string;
    signee: {
      name: string;
    };
  }[];
}[]

export type SignatureAsset = {
  id: string;
  signatureUrl: string;
  createdAt: string;
  updatedAt: string;
  signeeId: string;
}