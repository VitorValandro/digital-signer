import React, {ReactNode, createContext, useContext, useState} from "react";

type DocumentContextProps = {
  positions: DOMRect | undefined;
  setPositions: (rect: DOMRect | undefined) => void;
  signatures: Array<ContextSignature>;
  addSignature: (signature: ContextSignature) => void;
  removeSignature: (index: number) => void;
  updateSignature: (
    index: number,
    updatedSignature: Partial<ContextSignature>
  ) => void;
  pageNumber: number;
  setPageNumber: (page: number | ((prevPage: number) => number)) => void;
  title: string | undefined;
  setTitle: (title: string) => void;
};

const DocumentContext = createContext<DocumentContextProps>({
  positions: undefined,
  setPositions: () => {},
  signatures: [],
  addSignature: (signature: ContextSignature) => null,
  removeSignature: (index: number) => null,
  updateSignature: (
    index: number,
    updatedSignature: Partial<ContextSignature>
  ) => null,
  pageNumber: 1,
  setPageNumber: (page: number | ((prevPage: number) => number)) => null,
  title: undefined,
  setTitle: (title: string) => null,
});

export const useDocumentContext = () => useContext(DocumentContext);

export default function DocumentContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [positions, setPositions] = useState<DOMRect | undefined>(undefined);
  const [signatures, setSignatures] = useState<Array<ContextSignature>>([]);
  const [title, setTitle] = useState<string>();

  const addSignature = (newSignature: ContextSignature) => {
    setSignatures([...signatures, newSignature]);
  };

  const updateSignature = (
    index: number,
    updatedSignature: Partial<ContextSignature>
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
          title,
          setTitle,
        }}
      >
        {children}
      </DocumentContext.Provider>
    </>
  );
}
