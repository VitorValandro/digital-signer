import PDFDocument, {DocumentLoadingSpinner} from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";
import {Rnd} from "react-rnd";
import {useEffect, useRef, useState} from "react";
import {storageProvider} from "@/storage/storageProvider";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {SignaturesAside} from "@/components/SignaturesAside";
import {
  getElementPositions,
  validateAllSignatures,
} from "@/utils/position-validation";

const DEFAULT_SIGNATURE_WIDTH = 200;
const DEFAULT_SIGNATURE_HEIGHT = 50;

export default function Home() {
  const [file, setFile] = useState<ArrayBufferLike>();
  const [allInvalid, setAllInvalid] = useState(false);
  const {positions, signatures, setSignatures} = useDocumentContext();
  const signaturesRefs = useRef<Array<Rnd>>([]);

  useEffect(() => {
    const getFile = async () => {
      const {file, fileName} = await storageProvider.download(
        "https://mega.nz/file/4EN21bZJ#L-BSTZC5tzRqi-V-9BfWh93gyAZO_v-8iVUL_iCmRd0"
      );

      setFile(file.buffer);
    };
    getFile();
  }, []);

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  const checkSignatures = () => {
    if (!positions || !signaturesRefs.current) return;

    const elements = signaturesRefs.current.map((ref) => {
      return getElementPositions(ref);
    });

    const isSignaturesInvalid = validateAllSignatures(elements, positions);
    setAllInvalid(isSignaturesInvalid);
  };

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 z-0 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
          {file ? (
            <PDFDocument fileBuffer={file} />
          ) : (
            <>
              <DocumentLoadingSpinner message="Fazendo download do arquivo..." />
            </>
          )}
        </div>
        {signatures.map((signature, index) => {
          return (
            <Rnd
              key={index}
              ref={(el) => {
                if (el) signaturesRefs.current[index] = el;
              }}
              className={`z-100 bg-transparent border-dashed border-2 ${
                allInvalid ? "border-orange-500" : "border-slate-600"
              } p-3`}
              onDragStop={checkSignatures}
              onResizeStop={checkSignatures}
              default={{
                x: positions?.x || 0,
                y: positions?.y || 0,
                width: DEFAULT_SIGNATURE_WIDTH,
                height: DEFAULT_SIGNATURE_HEIGHT,
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
      <SignaturesAside />
    </>
  );
}
