type SignatureAsset = {
  id: string;
  signatureUrl: string;
};

type Signature = {
  id: string;
  isSigned: boolean;
  signedAt?: string;
  pageIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
  documentId?: string;
  signee: {
    name: string;
    email: string;
  };
  signatureAsset: SignatureAsset;
};

type DocumentById = {
  id: string;
  blankDocumentUrl: string;
  signedDocumentUrl: string;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    name: string;
  };
  signatures: Signature[];
  pendingSignatures: Signature[];
};