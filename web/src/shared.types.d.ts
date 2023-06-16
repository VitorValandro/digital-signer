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

type DocumentByUser = {
  id: string;
  createdAt: string;
  owner: {
    name: string;
  };
  signatures: {
    isSigned: boolean;
    signedAt?: string;
    signee: {
      id: string;
      name: string;
    };
  }[];
}[];

type DocumentVerificationResponse = {
  valid: boolean;
  message: string;
  document?: {
    id: string;
    title: string;
    blankDocumentUrl: string;
    signedDocumentUrl: string | null;
    block: number | null;
    createdAt: Date;
    owner: {
      name: string;
      email: true;
    };
    signatures: {
      isSigned: boolean;
      signedAt?: string;
      signee: {
        name: string;
        email: true;
      };
    }[]
  }
};