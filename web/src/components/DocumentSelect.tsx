import {getUserId} from "@/services/auth";
import {ChangeEvent, DragEvent, useRef, useState} from "react";
import {toast} from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";

type DocumentSelectProps = {
  setBufferFile: (file: ArrayBufferLike) => void;
  setUploadFile: (file: File) => void;
};

export default function DocumentSelect({
  setBufferFile,
  setUploadFile,
}: DocumentSelectProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSubmit = (files: FileList) => {
    if (!files?.length) return;
    const file = files[0];

    if (file.type !== "application/pdf")
      toast.warning("Apenas arquivos PDF podem ser usados como documentos");

    setIsLoading(true);
    setUploadFile(file);

    file
      .arrayBuffer()
      .then((buffer) => {
        setBufferFile(buffer);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        toast.warning("Ocorreu um erro ao fazer o upload do arquivo");
      });
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSubmit(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      handleFileSubmit(target.files);
    }
  };

  const onButtonClick = () => {
    if (!inputRef?.current) return;
    inputRef.current.click();
  };
  return (
    <div
      onDragEnter={handleDrag}
      className={`flex items-center bg-slate-100 justify-center w-[800px] h-screen border-dashed border-2 ${
        dragActive ? "border-orange-400" : "border-slate-400"
      }`}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept="application/pdf"
          />
          <button
            onClick={onButtonClick}
            className={`flex w-full h-full justify-center items-center flex-col px-10 ${
              dragActive ? "text-orange-400" : "text-slate-400"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-24 h-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>

            <p className="font-medium mt-5">
              Arraste o arquivo PDF do documento ou clique aqui para
              selecioná-lo
            </p>
          </button>

          {dragActive && (
            <div
              className="absolute w-full h-full"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            ></div>
          )}
        </>
      )}
    </div>
  );
}
