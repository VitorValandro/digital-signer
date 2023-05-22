import "react-toastify/dist/ReactToastify.css";
import DocumentContextProvider from "@/contexts/DocumentContext";
import "../styles/globals.css";
import type {AppProps} from "next/app";
import {useEffect} from "react";
import {pdfjs} from "react-pdf";
import {ToastContainer} from "react-toastify";

export default function App({Component, pageProps}: AppProps) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.js",
      import.meta.url
    ).toString();
  }, []);
  return (
    <DocumentContextProvider>
      <Component {...pageProps} />
      <ToastContainer
        position={"bottom-right"}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme={"colored"}
      />
    </DocumentContextProvider>
  );
}
