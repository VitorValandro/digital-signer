import React, {ReactNode, createContext, useContext, useState} from "react";

type Signature = {
  signeeId: string;
  email?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pageIndex: number;
};

type DocumentContextProps = {
  positions: DOMRect | undefined;
  setPositions: (rect: DOMRect | undefined) => void;
  signatures: Array<Signature>;
  addSignature: (signature: Signature) => void;
  removeSignature: (index: number) => void;
  updateSignature: (
    index: number,
    updatedSignature: Partial<Signature>
  ) => void;
  pageNumber: number;
  setPageNumber: (page: number | ((prevPage: number) => number)) => void;
};

const DocumentContext = createContext<DocumentContextProps>({
  positions: undefined,
  setPositions: () => {},
  signatures: [],
  addSignature: (signature: Signature) => null,
  removeSignature: (index: number) => null,
  updateSignature: (index: number, updatedSignature: Partial<Signature>) =>
    null,
  pageNumber: 1,
  setPageNumber: (page: number | ((prevPage: number) => number)) => null,
});

export const useDocumentContext = () => useContext(DocumentContext);

export default function DocumentContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [positions, setPositions] = useState<DOMRect | undefined>(undefined);
  const [signatures, setSignatures] = useState<Array<Signature>>([]);

  const addSignature = (newSignature: Signature) => {
    setSignatures([...signatures, newSignature]);
  };

  const updateSignature = (
    index: number,
    updatedSignature: Partial<Signature>
  ) => {
    const newSignaturesArray = signatures.map((signature, i) => {
      if (i === index) return {...signature, ...updatedSignature};
      return signature;
    });

    setSignatures(newSignaturesArray);
  };

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  return (
    <>
      <DocumentContext.Provider
        value={{
          positions,
          setPositions,
          signatures,
          addSignature,
          removeSignature,
          updateSignature,
          pageNumber,
          setPageNumber,
        }}
      >
        {children}
      </DocumentContext.Provider>
    </>
  );
}
