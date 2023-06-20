import {ChangeEvent, DragEvent, useRef, useState} from "react";
import {toast} from "react-toastify";
import {KeyedMutator} from "swr";

import api from "@/services/api";
import LoadingSpinner from "./LoadingSpinner";
import {getUserThatIsAuthenticated} from "@/services/auth";

type AddSignatureCardProps = {
  revalidationFunction: KeyedMutator<SignatureAsset[]>;
};

export function AddSignatureCard({
  revalidationFunction,
}: AddSignatureCardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = getUserThatIsAuthenticated();

  const handleFileSubmit = (files: FileList) => {
    if (!user) return;
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image"))
      toast.warning(
        "Apenas arquivos de imagem podem ser adicionados como assinaturas"
      );

    setIsLoading(true);
    const body = new FormData();

    body.append("userId", user.id);
    body.append("signature", file);

    api
      .post("signatures/assets/upload", body)
      .then((response) => {
        revalidationFunction();
        toast.success("Assinatura adicionada!");

        setIsLoading(false);
      })
      .catch((err) => {
        const message =
          err.response.data?.message || "Ocorreu um erro ao acessar o servidor";

        toast.warning(message);

        setIsLoading(false);
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

  // triggers when file is dropped
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSubmit(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      handleFileSubmit(target.files);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    if (!inputRef?.current) return;
    inputRef.current.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      className={`max-w-sm h-72 flex justify-center items-center bg-gradient-to-tr from-slate-100 via-white to-slate-50 rounded-lg border-dashed border-4 ${
        dragActive ? "dragging border-orange-300" : "border-slate-300"
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
            accept="image/*"
          />
          <button
            onClick={onButtonClick}
            className="flex justify-center items-center flex-col px-10 text-slate-500 dragging-text-orange-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="w-24 h-24 stroke-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <p>
              Arraste a imagem da assinatura ou clique aqui para selecioná-la
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
