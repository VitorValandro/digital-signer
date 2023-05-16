import PDFDocument, {DocumentLoadingSpinner} from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";
import {Rnd} from "react-rnd";
import {useEffect, useRef, useState} from "react";
import {storageProvider} from "@/storage/storageProvider";
import {useDocumentContext} from "@/contexts/DocumentContext";

const DEFAULT_SIGNATURE_WIDTH = 100;
const DEFAULT_SIGNATURE_HEIGHT = 50;

export default function Home() {
  const [file, setFile] = useState<ArrayBufferLike>();
  const {positions} = useDocumentContext();
  const signaturesRefs = useRef<Array<Rnd>>([0]);

  useEffect(() => {
    const getFile = async () => {
      const {file, fileName} = await storageProvider.download(
        "https://mega.nz/file/4EN21bZJ#L-BSTZC5tzRqi-V-9BfWh93gyAZO_v-8iVUL_iCmRd0"
      );

      setFile(file.buffer);
    };
    getFile();
  }, []);

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
        <div className="p-4 z-10 flex items-center mt-5">
          {signaturesRefs.current.map((signature, index) => {
            return (
              <Rnd
                key={index}
                ref={(el) => {
                  if (el) signaturesRefs.current[0] = el;
                }}
                className="bg-orange-100"
                onDragStop={() => {
                  console.log(positions);
                  console.log(signaturesRefs.current[0].getDraggablePosition());
                }}
                // onResizeStop={checkSignatures}
                default={{
                  x: positions?.x || 0,
                  y: positions?.y || -800,
                  width: DEFAULT_SIGNATURE_WIDTH,
                  height: DEFAULT_SIGNATURE_HEIGHT,
                }}
                bounds=".react-pdf__Page__canvas"
              >
                <div>ASSINATURA</div>
              </Rnd>
            );
          })}
        </div>
      </div>
    </>
  );
}
