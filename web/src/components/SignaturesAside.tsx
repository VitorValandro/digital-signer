import {useState} from "react";

import {useDocumentContext} from "@/contexts/DocumentContext";
import {AddSigneeInput} from "./AddSigneeInput";

export function SignaturesAside() {
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
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
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

        {signatures.map((signature, index) => {
          return (
            <div key={index} className="border-b-2 border-dashed">
              <div className="inline-flex w-full px-5 justify-evenly items-center">
                <p className="font-sm text-slate-500">{signature.email}</p>
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
    </aside>
  );
}
