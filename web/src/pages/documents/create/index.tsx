import {Rnd} from "react-rnd";
import {useRef, useState} from "react";

import PDFDocument from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {SignaturesAside} from "@/components/SignaturesAside";
import DocumentSelect from "@/components/DocumentSelect";
import {
  getElementPositions,
  validateAllSignatures,
} from "@/utils/position-validation";
import api from "@/services/api";
import {toast} from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";
import {useRouter} from "next/router";

const DEFAULT_SIGNATURE_WIDTH = 200;
const DEFAULT_SIGNATURE_HEIGHT = 50;

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [file, setFile] = useState<ArrayBufferLike>();
  const [allInvalid, setAllInvalid] = useState(false);
  const {positions, signatures, removeSignature, updateSignature, pageNumber} =
    useDocumentContext();
  const signaturesRefs = useRef<Array<Rnd>>([]);
  const router = useRouter();

  const updateSignaturePosition = (event: unknown, index: number) => {
    const ref = signaturesRefs.current[index];
    if (!ref || !positions) return;

    const absolutePosition = ref.getDraggablePosition();

    const updatedSignature = {
      x: absolutePosition.x - positions.x,
      y: absolutePosition.y - positions.y,
      width: ref?.resizableElement.current?.offsetWidth,
      height: ref?.resizableElement.current?.offsetHeight,
    };

    updateSignature(index, updatedSignature);
    checkSignatures();
  };

  const checkSignatures = () => {
    if (!positions || !signaturesRefs.current) return;

    const elements = signaturesRefs.current.map((ref) => {
      return getElementPositions(ref);
    });

    const isSignaturesInvalid = validateAllSignatures(elements, positions);
    setAllInvalid(isSignaturesInvalid);
  };

  const submitDocument = () => {
    if (!file) return;
    setIsSubmitted(true);
    setIsUploading(true);
    setIsCreating(true);
    const documentUploadBody = new FormData();

    documentUploadBody.append("document", new Blob([file]));

    api
      .post("document/upload", documentUploadBody)
      .then((res) => {
        const uploadResponse = res.data as {
          fileName: string;
          storageUrl: string;
        };

        setIsUploading(false);

        const data = {
          documentUrl: uploadResponse.storageUrl,
          signatures: signatures.map((signature) => {
            delete signature.email;
            return signature;
          }),
        };

        api
          .post("document", data)
          .then((response) => {
            setIsCreating(false);
          })
          .catch((err) => {
            const message =
              err.response?.data?.message ||
              "Ocorreu um erro ao acessar o servidor";

            toast.warning(message);
            setIsCreating(false);
            setIsSubmitted(false);
          });
      })
      .catch((err) => {
        const message =
          err.response.data?.message || "Ocorreu um erro ao acessar o servidor";

        toast.warning(message);
        setIsUploading(false);
        setIsSubmitted(false);
      });
  };

  return (
    <>
      <Sidebar />
      {!isSubmitted ? (
        <>
          <div className="p-4 sm:p-16 sm:ml-64">
            <div className="p-4 z-0 border-2 border-gray-200 border-dashed rounded-lg">
              {file ? (
                <PDFDocument fileBuffer={file} />
              ) : (
                <DocumentSelect setBufferFile={setFile} />
              )}
            </div>
            {signatures.map((signature, index) => {
              if (signature.pageIndex == pageNumber - 1)
                return (
                  <Rnd
                    key={index}
                    ref={(el) => {
                      if (el) signaturesRefs.current[index] = el;
                    }}
                    className={`z-100 bg-transparent border-dashed border-2 ${
                      allInvalid ? "border-orange-500" : "border-slate-600"
                    } p-3`}
                    onDragStop={(e) => updateSignaturePosition(e, index)}
                    onResizeStop={(e) => updateSignaturePosition(e, index)}
                    default={{
                      x:
                        signature.x && positions
                          ? positions.x + signature.x - 256
                          : positions?.x || 0,
                      y:
                        signature.y && positions
                          ? positions.y + signature.y
                          : positions?.y || 0,
                      width: signature.width || DEFAULT_SIGNATURE_WIDTH,
                      height: signature.height || DEFAULT_SIGNATURE_HEIGHT,
                    }}
                    bounds=".react-pdf__Page__canvas"
                  >
                    <span
                      data-ui={`${allInvalid ? "invalid" : ""}`}
                      className="absolute -top-5 left-0 text-slate-400 data-invalid:text-orange-400 font-medium text-sm whitespace-nowrap"
                    >
                      Assinatura {index + 1}
                    </span>
                    <span
                      data-ui={`${allInvalid ? "invalid" : ""}`}
                      className="absolute -bottom-5 left-0 text-slate-400 data-invalid:text-orange-400 font-medium text-sm"
                    >
                      {signature.email}
                    </span>
                    <button
                      onClick={() => {
                        removeSignature(index);
                      }}
                      className="absolute -top-5 -right-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        data-ui={`${allInvalid ? "invalid" : ""}`}
                        strokeWidth={2}
                        className="w-5 h-5 stroke-slate-400 data-invalid:stroke-orange-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Rnd>
                );
            })}
          </div>
          <SignaturesAside
            isFileSelected={!!file}
            onDocumentCreate={submitDocument}
          />
        </>
      ) : (
        <div className="w-5/6 h-screen p-4 sm:p-16 sm:ml-64 flex flex-col items-center justify-center">
          <div className="w-[400px] grid grid-cols-[20%_80%] items-center gap-y-10">
            {isUploading ? (
              <>
                <LoadingSpinner size={14} />{" "}
                <p className="font-medium text-lg text-slate-600">
                  Fazendo o upload do documento
                </p>
              </>
            ) : (
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
                  Upload do documento completo
                </p>
              </>
            )}

            {isCreating ? (
              <>
                <LoadingSpinner size={14} />{" "}
                <p className="font-medium text-lg text-slate-600">
                  Criando assinaturas
                </p>
              </>
            ) : (
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
                  Documento e assinaturas criados com sucesso
                </p>
              </>
            )}
          </div>

          {!isCreating && !isUploading ? (
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
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
}
