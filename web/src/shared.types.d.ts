type AuthSession = {
  token: string;
  expiresAt: string;
} & User;

type User = {
  id: string;
  name: string;
  email: string;
}

type SignatureAsset = {
  id: string;
  signatureUrl: string;
  createdAt: string;
  updatedAt: string;
  signeeId: string;
};

type ContextSignature = {
  signeeId: string;
  email?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pageIndex: number;
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
  title: string;
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
  title: string;
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