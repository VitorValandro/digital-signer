import React, {ReactNode, createContext, useContext, useState} from "react";

type Signature = {
  email: string;
};

type DocumentContextProps = {
  positions: DOMRect | undefined;
  setPositions: (rect: DOMRect | undefined) => void;
  signatures: Array<Signature>;
  setSignatures: (signatures: Array<Signature>) => void;
};

const DocumentContext = createContext<DocumentContextProps>({
  positions: undefined,
  setPositions: () => {},
  signatures: [],
  setSignatures: () => {},
});

export const useDocumentContext = () => useContext(DocumentContext);

export default function DocumentContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [positions, setPositions] = useState<DOMRect | undefined>(undefined);
  const [signatures, setSignatures] = useState<Array<Signature>>([]);

  return (
    <>
      <DocumentContext.Provider
        value={{positions, setPositions, signatures, setSignatures}}
      >
        {children}
      </DocumentContext.Provider>
    </>
  );
}
