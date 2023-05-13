"use client";
import Image from "next/image";
import {storageProvider} from "@/storage/storageProvider";
import {useEffect, useState} from "react";

export default function SignatureCard() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const getFile = async () => {
      const {file, fileName} = await storageProvider.download(
        "https://mega.nz/file/VItFSAgI#y6BCE_iU9AzfOqn7-4jiKr77g-gvCD2RUocmjDoNyDA"
      );

      const blob = new Blob([file]);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    };

    getFile();
  }, []);

  return (
    <div className="group p-0 justify-items-center max-w-sm h-72 bg-gradient-to-t from-slate-200 via white to-slate-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="h-2/3">
        <div className="transition-colors ease-in-out duration-500 block justify-center w-full h-full relative bg-transparent">
          {imageUrl && (
            <Image
              className="rounded-t-lg object-contain"
              src={imageUrl}
              fill
              alt=""
            />
          )}
        </div>
      </div>

      <div className="h-1/3 bg-slate-100 rounded-lg rounded-t-[40px]">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center p-5">
          <p className="transition-all ease-in-out duration-500 font-light text-slate-500 dark:text-gray-400">
            • Adicionada em 10/05/2023
          </p>
          <button className="transition-colors ease-in-out duration-500 hover:bg-orange-300 hover:text-white inline-flex items-center px-3 py-2 text-sm text-slate-600 font-medium text-center bg-gray-100 border border-gray-300 hover:border-orange-300 rounded-lg dark:bg-orange-600 dark:hover:bg-orange-700">
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
