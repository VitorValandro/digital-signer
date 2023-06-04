import {useState} from "react";

import {useDocumentContext} from "@/contexts/DocumentContext";
import {AddSigneeInput} from "./AddSigneeInput";
import Link from "next/link";

type SignaturesAsideProps = {
  isFileSelected: boolean;
  onDocumentCreate: () => void;
};

export function SignaturesAside({
  isFileSelected,
  onDocumentCreate,
}: SignaturesAsideProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigneeInputOpen, setIsSigneeInputOpen] = useState(false);
  const {positions, signatures, removeSignature} = useDocumentContext();

  return (
    <aside
      id="logo-sidebar"
      className={`fixed top-0 right-0 z-40 w-1/5 h-screen pt-20 transition-transform ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      }  md:translate-x-0 lg:translate-x-0 bg-white border-r border-gray-200`}
      aria-label="Sidebar"
    >
      {isSigneeInputOpen ? (
        <AddSigneeInput
          close={() => setIsSigneeInputOpen(false)}
        ></AddSigneeInput>
      ) : (
        <></>
      )}
      <div className="h-full px-3 pb-4 bg-white dark:bg-gray-800">
        {isFileSelected ? (
          <>
            <button
              onClick={() => {
                setIsSigneeInputOpen(true);
              }}
              type="button"
              className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <p className="text-base">Adicionar assinatura</p>
            </button>

            <div className="h-4/5 overflow-y-auto">
              {signatures.map((signature, index) => {
                return (
                  <div key={index} className="border-b-2 border-dashed">
                    <div className="inline-flex w-full px-5 justify-evenly items-center">
                      <p className="font-sm text-slate-500">
                        {signature.email}
                      </p>
                      <button
                        onClick={() => {
                          removeSignature(index);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          className="w-5 h-5 stroke-slate-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-0 lg:grid-cols-4 text-xs mt-2 p-3">
                      <span className="font-medium">x:</span>
                      <span>{signature?.x?.toFixed(2) || 0}</span>
                      <span className="font-medium">y:</span>
                      <span>{signature?.y?.toFixed(2) || 0}</span>
                      <span className="font-medium">altura:</span>
                      <span>{signature?.height?.toFixed(2) || 0}</span>
                      <span className="font-medium">largura:</span>
                      <span>{signature?.width?.toFixed(2) || 0}</span>
                      <span className="font-medium">página nº:</span>
                      <span>{signature?.pageIndex + 1 || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-1/5 mt-5">
              {signatures.length ? (
                <button
                  onClick={onDocumentCreate}
                  type="button"
                  className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                  <p className="text-base">Criar documento</p>
                </button>
              ) : (
                <></>
              )}

              <Link
                href={"/"}
                className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-base">Cancelar</p>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-slate-500 w-full font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center justify-center">
              <p>Selecione um documento</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
