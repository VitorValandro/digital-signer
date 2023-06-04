import {useEffect, useState} from "react";
import Image from "next/image";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {storageProvider} from "@/services/storage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StaticSignature({signature}: {signature: Signature}) {
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
      className="group absolute hover:border-2 hover:border-dashed cursor-not-allowed"
      style={{
        top: `${positions.y + signature.y}px`,
        left: `${positions.x + signature.x}px`,
        width: `${signature.width}px`,
        height: `${signature.height}px`,
      }}
    >
      {imageUrl ? (
        <Image
          fill
          src={imageUrl}
          alt={`Assinatura de ${signature.signee.name}`}
        />
      ) : (
        <LoadingSpinner size={8} />
      )}
      {signature.signedAt && (
        <span
          className="group-hover:opacity-90 mt-5 transition-opacity bg-orange-500 p-1 w-64 text-center text-sm text-gray-100 rounded-md absolute left-1/2 
    -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto"
        >
          Assinado por {signature.signee.name} em{" "}
          {new Date(signature.signedAt).toLocaleDateString("pt-br")}
        </span>
      )}
    </div>
  ) : (
    <></>
  );
}
