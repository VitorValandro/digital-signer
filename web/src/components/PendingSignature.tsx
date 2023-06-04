import {useState} from "react";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {storageProvider} from "@/services/storage";

export default function PendingSignature({
  pendingSignature,
  setSignedSignatures,
  asset,
}: {
  pendingSignature: Signature;
  setSignedSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
  asset: SignatureAsset;
}) {
  const {positions, pageNumber} = useDocumentContext();
  const [isSigned, setIsSigned] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const sign = async () => {
    const newSignedSignature = {
      ...pendingSignature,
      signatureAsset: asset,
      signatureAssetId: asset.id,
      isSigned: true,
    };

    setSignedSignatures((signedSignatures) => [
      ...signedSignatures,
      newSignedSignature,
    ]);

    setIsSigned(true);

    const {file, fileName} = await storageProvider.download(
      newSignedSignature.signatureAsset.signatureUrl
    );

    const blob = new Blob([file]);
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
  };

  return positions && pageNumber === pendingSignature.pageIndex + 1 ? (
    <div
      className={`absolute flex justify-center items-center border-2 ${
        isSigned ? "border-gray-200" : "border-orange-300"
      } border-dashed rounded-lg`}
      style={{
        top: `${positions.y + pendingSignature.y}px`,
        left: `${positions.x + pendingSignature.x}px`,
        width: `${pendingSignature.width}px`,
        height: `${pendingSignature.height}px`,
      }}
    >
      {isSigned ? (
        imageUrl ? (
          <Image
            fill
            src={imageUrl}
            alt={`Assinatura de ${pendingSignature.signee.name}`}
          />
        ) : (
          <LoadingSpinner size={8} />
        )
      ) : (
        <button
          onClick={sign}
          className="px-2 py-1 bg-orange-400 text-slate-50 rounded-md text-xs font-medium"
        >
          ASSINAR
        </button>
      )}
    </div>
  ) : (
    <></>
  );
}
