import {useEffect, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/router";
import useSWR from "swr";

import PDFDocument, {DocumentLoadingSpinner} from "@/components/PDFDocument";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

import {storageProvider} from "@/services/storage";
import {fetcher} from "@/services/api";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {AssetsAside} from "@/components/AssetsAside";

type Signature = {
  id: string;
  isSigned: boolean;
  signedAt?: string;
  pageIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
  signee: {
    name: string;
    email: string;
  };
  signatureAsset: {
    id: string;
    signatureUrl: string;
  };
};

type DocumentById = {
  id: string;
  blankDocumentUrl: string;
  signedDocumnetUrl: string;
  owner: {
    id: string;
    email: string;
  };
  signatures: Signature[];
  pendingSignatures: Signature[];
};

export default function SignDocumentPage() {
  const router = useRouter();
  const {data, error, isLoading} = useSWR<DocumentById>(
    `document/${router.query.documentId}`,
    fetcher
  );

  const [file, setFile] = useState<ArrayBufferLike>();
  const [currentSelectedAsset, setCurrentSelectedAsset] = useState<string>();

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
                data.signatures.map((signature) => {
                  return (
                    <StaticSignature key={signature.id} signature={signature} />
                  );
                })}
              {/* ASSINATURAS PENDENTES */}
              {data?.pendingSignatures &&
                data.pendingSignatures.map((pendingSignature) => {
                  return (
                    <PendingSignature
                      key={pendingSignature.id}
                      pendingSignature={pendingSignature}
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
        onSignaturesSubmit={() => {}}
      />
    </>
  );
}

function StaticSignature({signature}: {signature: Signature}) {
  const {positions, pageNumber} = useDocumentContext();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const getImageFile = async () => {
      const {file, fileName} = await storageProvider.download(
        signature.signatureAsset.signatureUrl
      );

      const blob = new Blob([file]);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    };

    getImageFile();
  }, [signature]);

  return positions && pageNumber === signature.pageIndex + 1 ? (
    <div
      className="absolute"
      style={{
        top: `${positions.y + signature.y}px`,
        left: `${positions.x + signature.x}px`,
      }}
    >
      {imageUrl ? (
        <Image
          className="rounded-t-lg object-contain"
          src={imageUrl}
          width={signature.width}
          height={signature.height}
          alt={`Assinatura de ${signature.signee.name}`}
        />
      ) : (
        <LoadingSpinner size={8} />
      )}
    </div>
  ) : (
    <></>
  );
}

function PendingSignature({pendingSignature}: {pendingSignature: Signature}) {
  const {positions, pageNumber} = useDocumentContext();
  return positions && pageNumber === pendingSignature.pageIndex + 1 ? (
    <div
      className="absolute"
      style={{
        top: `${positions.y + pendingSignature.y}px`,
        left: `${positions.x + pendingSignature.x}px`,
      }}
    >
      ASSINATURA PENDENTE
      {/* {imageUrl ? (
        <Image
          className="rounded-t-lg object-contain"
          src={imageUrl}
          width={pendingSignature.width}
          height={pendingSignature.height}
          alt={`Assinatura de ${pendingSignature.signee.name}`}
        />
      ) : (
        <LoadingSpinner size={8} />
      )} */}
    </div>
  ) : (
    <></>
  );
}
