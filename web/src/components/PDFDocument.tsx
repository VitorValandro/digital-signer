import React, {useCallback, useEffect, useState} from "react";
import {Document, Page, pdfjs} from "react-pdf";
import useWindowSize from "../hooks/useWindowDimensions";
import {useDocumentContext} from "@/contexts/DocumentContext";

interface Props {
  fileBuffer: ArrayBufferLike;
}

export default function PDFDocument({fileBuffer}: Props) {
  const [file, setFile] = useState<{data: ArrayBufferLike}>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const {width, height} = useWindowSize();

  const {positions, setPositions} = useDocumentContext();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  function onDocumentLoadSuccess({numPages}: {numPages: number}) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const storePagePositions = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) setPositions(canvasRect);
  }, [setPositions]);

  useEffect(() => {
    setFile({data: fileBuffer});
  }, [fileBuffer]);

  useEffect(() => {
    storePagePositions();
  }, [width, height, storePagePositions]);

  return (
    <>
      <div className="p-5 border-dashed border-2 border-slate-300 w-auto inline-block">
        <div className="flex justify-between w-[800px] mb-3">
          <button
            disabled={pageNumber <= 1}
            onClick={previousPage}
            type="button"
            className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Página anterior
          </button>
          <div className="bg-transparent text-slate-500 px-2 py-2 rounded-lg font-medium">
            <p>
              {pageNumber || (numPages ? 1 : "--")} / {numPages || "--"}
            </p>
          </div>
          <button
            disabled={pageNumber >= numPages}
            onClick={nextPage}
            type="button"
            className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
          >
            Próxima página
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>

        <Document
          className="flex relative content-center items-center min-h-full"
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<DocumentLoadingSpinner message="Carregando documento..." />}
        >
          <Page
            width={800}
            canvasRef={canvasRef}
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={storePagePositions}
          />
        </Document>
      </div>
    </>
  );
}

export function DocumentLoadingSpinner({message}: {message: string}) {
  return (
    <>
      <div
        role="status"
        className="w-[800px] h-screen flex justify-center items-center flex-col"
      >
        <svg
          aria-hidden="true"
          className="w-16 h-16 mb-2 text-slate-300 animate-spin fill-slate-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">{message}</span>
        <h1 className="font-medium text-lg text-slate-600">{message}</h1>
      </div>
    </>
  );
}
