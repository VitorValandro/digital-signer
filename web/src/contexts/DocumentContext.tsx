import React, {ReactNode, createContext, useContext, useState} from "react";

type Signature = {
  email: string;
};

type DocumentContextProps = {
  positions: DOMRect | undefined;
  setPositions: (rect: DOMRect | undefined) => void;
  signatures: Array<Signature>;
  addSignature: (signature: Signature) => void;
  removeSignature: (index: number) => void;
};

const DocumentContext = createContext<DocumentContextProps>({
  positions: undefined,
  setPositions: () => {},
  signatures: [],
  addSignature: (signature: Signature) => null,
  removeSignature: (index: number) => null,
});

export const useDocumentContext = () => useContext(DocumentContext);

export default function DocumentContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [positions, setPositions] = useState<DOMRect | undefined>(undefined);
  const [signatures, setSignatures] = useState<Array<Signature>>([]);

  const addSignature = (newSignature: Signature) => {
    setSignatures([...signatures, newSignature]);
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
        }}
      >
        {children}
      </DocumentContext.Provider>
    </>
  );
}
