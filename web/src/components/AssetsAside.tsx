import {useEffect, useState} from "react";
import Image from "next/image";

import useSWR from "swr";
import {fetcher} from "@/services/api";
import LoadingSpinner from "./LoadingSpinner";
import {storageProvider} from "@/services/storage";
import Link from "next/link";

type AssetsAsideProps = {
  currentSelectedAsset: SignatureAsset | undefined;
  setCurrentSelectedAsset: (current: SignatureAsset) => void;
  onSignaturesSubmit: () => void;
};

export function AssetsAside({
  currentSelectedAsset,
  setCurrentSelectedAsset,
  onSignaturesSubmit,
}: AssetsAsideProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {data, error, isLoading} = useSWR<SignatureAsset[]>(
    `signatures/assets`,
    fetcher
  );

  useEffect(() => {
    const firstSignature = data?.at(0);
    if (!firstSignature) return;

    setCurrentSelectedAsset(firstSignature);
  }, [setCurrentSelectedAsset, data]);

  return (
    <aside
      id="logo-sidebar"
      className={`fixed top-0 right-0 z-40 w-1/5 h-screen pt-20 transition-transform ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      }  md:translate-x-0 lg:translate-x-0 bg-white border-r border-gray-200`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 bg-white dark:bg-gray-800">
        {data ? (
          <>
            <div className="h-4/5 overflow-y-auto">
              {data.map((asset) => {
                return (
                  <AssetComponent
                    key={asset.id}
                    asset={asset}
                    selected={asset.id == currentSelectedAsset?.id}
                    onSelect={setCurrentSelectedAsset}
                  />
                );
              })}
            </div>
            <div className="h-1/5 mt-5">
              <Link
                href={"/"}
                className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-base">Cancelar</p>
              </Link>

              <button
                onClick={onSignaturesSubmit}
                type="button"
                className="text-slate-500 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>

                <p className="text-base">Enviar assinaturas</p>
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-500 w-full h-full font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </aside>
  );
}

function AssetComponent({
  asset,
  selected,
  onSelect,
}: {
  asset: SignatureAsset;
  selected: boolean;
  onSelect: (current: SignatureAsset) => void;
}) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const getImageFile = async () => {
      const {file, fileName} = await storageProvider.download(
        asset.signatureUrl
      );

      const blob = new Blob([file]);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    };

    getImageFile();
  }, [asset]);

  return (
    <button
      onClick={() => {
        onSelect(asset);
      }}
      className={`group mt-2 cursor-pointer flex items-center justify-center w-full h-48 p-0 bg-white drop-shadow-md hover:shadow-inner border-2 rounded-lg ${
        selected
          ? `text-orange-400 border-orange-300`
          : `text-slate-600 border-gray-200`
      }`}
    >
      <div
        className={`absolute top-2 right-2 ${
          selected ? `block` : `hidden group-hover:block`
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="w-full h-full relative bg-transparent">
        {imageUrl ? (
          <Image
            className="rounded-t-lg object-contain"
            src={imageUrl}
            fill
            alt="Assinatura"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner size={8} />
          </div>
        )}
      </div>
    </button>
  );
}
