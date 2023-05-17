import {useDocumentContext} from "@/contexts/DocumentContext";
import {useState} from "react";

export function SignaturesAside() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {positions, signatures, setSignatures} = useDocumentContext();

  const addSignature = () => {
    console.log(positions);
    setSignatures([...signatures, {email: "vitormateusd@gmail.com"}]);
  };

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  return (
    <aside
      id="logo-sidebar"
      className={`fixed top-0 right-0 z-40 w-80 h-screen pt-20 transition-transform ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      }  md:translate-x-0 lg:translate-x-0 bg-white border-r border-gray-200`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        {signatures.map((signature, index) => {
          return (
            <div key={index}>
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
            </div>
          );
        })}
        <button
          onClick={addSignature}
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
      </div>
    </aside>
  );
}
