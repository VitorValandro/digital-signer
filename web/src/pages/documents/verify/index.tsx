import DocumentSelect from "@/components/DocumentSelect";
import LoadingSpinner from "@/components/LoadingSpinner";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import {storageProvider} from "@/services/storage";
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import {toast} from "react-toastify";

export default function VerifyDocumentPage() {
  const [uploadFile, setUploadFile] = useState<File>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] =
    useState<DocumentVerificationResponse["document"]>();
  const router = useRouter();

  const submitFileForVerification = useCallback(async () => {
    if (!uploadFile) return;

    setIsVerifying(true);

    const documentUploadBody = new FormData();
    documentUploadBody.append("document", uploadFile);

    api
      .post("/document/verify", documentUploadBody)
      .then((res) => {
        const verificationResponse = res.data as DocumentVerificationResponse;

        if (!verificationResponse.valid)
          setErrorMessage(verificationResponse.message);
        else {
          setDocumentDetails(verificationResponse.document);
          if (verificationResponse.message)
            toast.warning(verificationResponse.message);
        }

        setIsVerifying(false);
      })
      .catch((err) => {
        const message =
          err.response.data?.message || "Ocorreu um erro ao acessar o servidor";

        setErrorMessage(message);
        setIsVerifying(false);
      });
  }, [uploadFile]);

  const downloadFile = async (url: string | null) => {
    if (!url) return;
    setIsDownloading(true);
    const {file, fileName} = await storageProvider.download(url);
    const blob = new Blob([file]);
    const tmpUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = tmpUrl;
    anchor.download = fileName;
    anchor.click();
    setIsDownloading(false);
  };

  useEffect(() => {
    submitFileForVerification();
  }, [submitFileForVerification]);

  return (
    <>
      <Sidebar />
      <div className="p-4 min-h-screen lg:p-16 sm:ml-64 flex flex-col justify-center items-center">
        {!uploadFile ? (
          <>
            <h3 className="my-5 max-w-[800px] text-slate-600 font-medium text-xl">
              Faça o upload do arquivo PDF para verificar se o documento está
              assinado e autenticar sua veracidade e integridade
            </h3>
            <div className="p-4 z-0">
              <DocumentSelect setUploadFile={setUploadFile} />
            </div>
          </>
        ) : (
          <div className="w-[90%] sm:w-[60%] lg:w-[40%] mt-[100px] grid-cols-1 sm:grid grid-cols-[20%_80%] items-center gap-y-10">
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center gap-8">
                <p className="text-slate-600 font-medium text-lg">
                  Autenticando assinaturas do documento...
                </p>
                <LoadingSpinner size={16} />
              </div>
            ) : !errorMessage ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  className="hidden sm:block w-10 h-10 stroke-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <div>
                  <p className="font-bold text-lg text-orange-400">
                    Documento assinado!
                  </p>
                  <p className="font-medium text-lg text-slate-600">
                    O arquivo é íntegro e a autenticação das assinaturas foi
                    verificada e validada!
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="hidden sm:block w-10 h-10 stroke-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <div>
                  <p className="font-bold text-lg text-orange-400">
                    Documento inválido.
                  </p>
                  <p className="font-medium text-lg text-slate-600">
                    {errorMessage}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {documentDetails && (
          <div className="w-[90%] sm:w-[60%] mt-16">
            <div className="my-4">
              <h1 className="font-bold text-6xl text-slate-700">
                {documentDetails.title}
              </h1>
              <p className="font-medium text-slate-500">
                Documento criado por {documentDetails.owner.name} em{" "}
                {new Date(documentDetails.createdAt).toLocaleDateString(
                  "pt-br"
                )}
              </p>
              <p className="text-slate-400">{documentDetails.owner.email}</p>
            </div>

            <div>
              <h2 className="font-bold text-2xl text-slate-600">Assinaturas</h2>
              <div className="my-4 grid grid-cols-1 md:grid-cols-2">
                {documentDetails.signatures.map((signature) => {
                  return (
                    <div key={signature.signedAt}>
                      <h4 className="font-bold text-orange-500 text-lg">
                        {signature.signee.name}
                      </h4>
                      {signature.signedAt && (
                        <p className="font-medium text-slate-400">
                          {" "}
                          Assinado em{" "}
                          {new Date(signature.signedAt).toLocaleDateString(
                            "pt-br"
                          )}
                        </p>
                      )}
                      <p className="text-slate-400">{signature.signee.email}</p>
                    </div>
                  );
                })}
              </div>
              <div className="my-8 border-t-2 border-slate-300 border-dashed"></div>
              {!isDownloading ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 justify-items-center">
                  <button
                    onClick={() =>
                      downloadFile(documentDetails.blankDocumentUrl)
                    }
                    className="inline-flex w-full items-center justify-center py-2 px-4 bg-orange-400 text-slate-200 rounded-lg font-bold md:w-3/4 hover:bg-orange-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-6 h-6 mr-2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>

                    <span>Documento em branco</span>
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(documentDetails.signedDocumentUrl)
                    }
                    className="inline-flex w-full items-center justify-center py-2 px-4 bg-orange-400 text-slate-200 rounded-lg font-bold md:w-3/4 hover:bg-orange-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-6 h-6 mr-2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>

                    <span>Documento assinado</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        )}

        {!isVerifying && (
          <button
            onClick={() => {
              router.push("/");
            }}
            type="button"
            className="mt-16 text-slate-600 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
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

            <p className="text-base">Voltar aos seus documentos</p>
          </button>
        )}
      </div>
    </>
  );
}
