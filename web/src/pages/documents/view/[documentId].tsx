import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import useSWR from "swr";

import PDFDocument, {DocumentLoadingSpinner} from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";

import {storageProvider} from "@/services/storage";
import {fetcher} from "@/services/api";
import StaticSignature from "@/components/StaticSignature";
import {InfoAside} from "@/components/InfoAside";

export default function SignDocumentPage() {
  const router = useRouter();
  const {data, error, isLoading} = useSWR<DocumentById>(
    `document/view/${router.query.documentId}`,
    fetcher
  );

  const [file, setFile] = useState<ArrayBufferLike>();

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

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 z-0 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
          {file ? (
            <>
              <PDFDocument fileBuffer={file} />
              {/* ASSINATURAS JÁ ASSINADAS */}
              {data?.signatures &&
                data.signatures
                  .filter((signature) => signature.isSigned)
                  .map((signature) => {
                    return (
                      <StaticSignature
                        key={signature.id}
                        signature={signature}
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
      {data?.signatures && <InfoAside documentData={data} />}
    </>
  );
}
