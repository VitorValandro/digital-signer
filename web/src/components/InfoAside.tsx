import {storageProvider} from "@/services/storage";
import {useState} from "react";
import LoadingSpinner from "./LoadingSpinner";
import Link from "next/link";

type InfoAsideProps = {
  documentData: DocumentById;
};

export function InfoAside({documentData}: InfoAsideProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSignedFile = async () => {
    if (!documentData?.signedDocumentUrl) return;
    setIsDownloading(true);
    const {file, fileName} = await storageProvider.download(
      documentData.signedDocumentUrl
    );
    const blob = new Blob([file]);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setIsDownloading(false);
  };

  return (
    <aside
      id="logo-sidebar"
      className={`overflow-y-auto fixed top-0 right-0 z-40 w-1/5 h-screen pt-20 transition-transform ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      }  md:translate-x-0 lg:translate-x-0 bg-white border-r border-gray-200`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 bg-white dark:bg-gray-800">
        <div className="h-3/5 lg:h-4/5 overflow-y-auto">
          <div className="px-4">
            <p className="text-sm">
              Documento criado por {documentData.owner.name} em{" "}
              {new Date(documentData.createdAt).toLocaleDateString("pt-br")}
            </p>
            <p className="mt-2 font-medium">
              {
                documentData.signatures.filter(
                  (signature) => signature.isSigned
                ).length
              }{" "}
              / {documentData.signatures.length} assinaturas completas
            </p>
          </div>
          {documentData.signatures.map((signature) => {
            return (
              <SignatureInfo
                key={signature.id}
                signature={signature}
              ></SignatureInfo>
            );
          })}
        </div>

        <div className="h-2/5 lg:h-1/5 mt-2">
          <div className="px-4">
            {documentData.signedDocumentUrl ? (
              <button
                onClick={downloadSignedFile}
                className="w-full inline-flex items-center justify-center bg-orange-500 text-slate-50 rounded-lg font-medium px-2 py-2"
              >
                {!isDownloading ? (
                  <>
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
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>{" "}
                    <p>Baixar documento assinado</p>
                  </>
                ) : (
                  <LoadingSpinner size={6} />
                )}
              </button>
            ) : (
              <p className="text-slate-500 leading-1 text-sm">
                O documento será concluído quando todas as assinaturas estiverem
                completas.
              </p>
            )}
          </div>
          <Link
            href={"/"}
            className="text-slate-500 mt-5 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>

            <p className="text-base">Voltar</p>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SignatureInfo({signature}: {signature: Signature}) {
  return (
    <div
      className={`w-full p-4 mt-5 border-b-2 border-dashed ${
        signature.isSigned ? "border-orange-400" : "border-slate-300"
      } text-slate-600 text-sm`}
    >
      <div
        className={`flex justify-between ${
          signature.isSigned ? "text-orange-500" : "text-slate-600"
        }`}
      >
        <span className="font-medium text-lg">{signature.signee.name}</span>
        {signature.isSigned ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      {signature.signedAt ? (
        <div>
          Assinado em {new Date(signature.signedAt).toLocaleDateString("pt-br")}
        </div>
      ) : (
        <div>Assinatura pendente</div>
      )}

      <div className="text-slate-400">Página {signature.pageIndex + 1}</div>
    </div>
  );
}
