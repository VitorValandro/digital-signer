import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import useSWR from "swr";

import PDFDocument, {DocumentLoadingSpinner} from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

import {storageProvider} from "@/services/storage";
import api, {fetcher} from "@/services/api";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {AssetsAside} from "@/components/AssetsAside";
import {toast} from "react-toastify";
import StaticSignature from "@/components/StaticSignature";
import PendingSignature from "@/components/PendingSignature";

export default function SignDocumentPage() {
  const router = useRouter();
  const {data, error, isLoading} = useSWR<DocumentById>(
    `document/${router.query.documentId}`,
    fetcher
  );

  const {pageNumber} = useDocumentContext();
  const [file, setFile] = useState<ArrayBufferLike>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signedSignatures, setSignedSignatures] = useState<Signature[]>([]);
  const [currentSelectedAsset, setCurrentSelectedAsset] =
    useState<SignatureAsset>();

  useEffect(() => {
    const getFile = async () => {
      if (!data?.blankDocumentUrl) return;
      const {file, fileName} = await storageProvider.download(
        data.blankDocumentUrl
      );
      setFile(file.buffer);
    };
    getFile();
  }, [data]);

  const submitSignatures = () => {
    if (!data) return toast.warning("O documento não foi carregado");

    const remainingSignatures =
      data.pendingSignatures.length - signedSignatures.length;
    if (remainingSignatures !== 0)
      return toast.warning(
        `Você ainda precisa preencher ${remainingSignatures} assinatura${
          remainingSignatures > 1 ? "s" : ""
        }`
      );

    setIsSubmitted(true);
    setIsSigning(true);

    const body = signedSignatures.map((signature) => {
      const {documentId, signee, signatureAsset, ...properties} = signature;
      return {...properties};
    });

    api
      .post("signatures/sign", body)
      .then((res) => {
        setIsSigning(false);
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          "Ocorreu um erro ao acessar o servidor";

        setIsSigning(false);
        setSubmitError(message);
      });
  };

  return (
    <>
      <Sidebar />
      {!isSubmitted ? (
        <>
          <div className="p-4 sm:p-16 sm:ml-64">
            <div className="p-4 z-0 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
              {file ? (
                <>
                  <PDFDocument
                    fileBuffer={file}
                    highlightPreviousPage={data?.pendingSignatures.some(
                      (signature) => signature.pageIndex + 1 < pageNumber
                    )}
                    highlightNextPage={data?.pendingSignatures.some(
                      (signature) => signature.pageIndex + 1 > pageNumber
                    )}
                  />
                  {/* ASSINATURAS JÁ ASSINADAS */}
                  {data?.signatures &&
                    data.signatures.map((signature) => {
                      return (
                        <StaticSignature
                          key={signature.id}
                          signature={signature}
                        />
                      );
                    })}
                  {/* ASSINATURAS PENDENTES */}
                  {data?.pendingSignatures &&
                    currentSelectedAsset &&
                    data.pendingSignatures.map((pendingSignature) => {
                      return (
                        <PendingSignature
                          key={pendingSignature.id}
                          pendingSignature={pendingSignature}
                          setSignedSignatures={setSignedSignatures}
                          asset={currentSelectedAsset}
                        />
                      );
                    })}
                </>
              ) : (
                <>
                  <DocumentLoadingSpinner message="Fazendo download do arquivo..." />
                </>
              )}
            </div>
          </div>
          <AssetsAside
            currentSelectedAsset={currentSelectedAsset}
            setCurrentSelectedAsset={setCurrentSelectedAsset}
            onSignaturesSubmit={submitSignatures}
          />
        </>
      ) : (
        <div className="w-5/6 h-screen p-4 sm:p-16 sm:ml-64 flex flex-col items-center justify-center">
          <div className="w-[400px] grid grid-cols-[20%_80%] items-center gap-y-10">
            {isSigning ? (
              <>
                <LoadingSpinner size={14} />{" "}
                <p className="font-medium text-lg text-slate-600">
                  Submetendo suas assinaturas e assinando o documento
                </p>
              </>
            ) : !submitError ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  className="w-10 h-10 stroke-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <p className="font-medium text-lg text-slate-600">
                  Assinaturas submetidas com sucesso
                </p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-10 h-10 stroke-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="font-medium text-lg text-slate-600">
                  {submitError}
                </p>
              </>
            )}
          </div>

          {!isSigning && (
            <>
              <button
                onClick={() => {
                  router.push("/");
                }}
                type="button"
                className="mt-32 text-slate-600 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
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
            </>
          )}
        </div>
      )}
    </>
  );
}
