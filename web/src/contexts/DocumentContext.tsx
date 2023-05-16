import React, {ReactNode, createContext, useContext, useState} from "react";

type DocumentContextProps = {
  positions: DOMRect | undefined;
  setPositions: (rect: DOMRect | undefined) => void;
};

const DocumentContext = createContext<DocumentContextProps>({
  positions: undefined,
  setPositions: () => {},
});

export const useDocumentContext = () => useContext(DocumentContext);

export default function DocumentContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [positions, setPositions] = useState<DOMRect | undefined>(undefined);

  return (
    <>
      <DocumentContext.Provider value={{positions, setPositions}}>
        {children}
      </DocumentContext.Provider>
    </>
  );
}
