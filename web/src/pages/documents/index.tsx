"use client";
import React, {useCallback, useEffect, useState} from "react";
import {Document, Page} from "react-pdf";
import useWindowSize from "../../hooks/useWindowDimensions";

interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setPositions: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  documentUrl: string;
}

export default function PDFDocument({
  setCurrentPage,
  setPositions,
  documentUrl,
}: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const {width, height} = useWindowSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  function onDocumentLoadSuccess({numPages}: {numPages: number}) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
    setCurrentPage((prevPageIndex) => prevPageIndex + offset);
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
    storePagePositions();
  }, [width, height, storePagePositions]);

  return (
    <>
      <div>
        <div>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
          >
            Página anterior
          </button>
          <div>
            <p>
              {pageNumber || (numPages ? 1 : "--")} / {numPages || "--"}
            </p>
          </div>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={nextPage}
          >
            Próxima página
          </button>
        </div>

        <Document file={documentUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
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
