import "../styles/globals.css";
import type {AppProps} from "next/app";
import {useEffect} from "react";
import {pdfjs} from "react-pdf";

export default function App({Component, pageProps}: AppProps) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.js",
      import.meta.url
    ).toString();
  }, []);
  return <Component {...pageProps} />;
}
