import api from "@/services/api";
import {getUserId} from "@/services/auth";
import {ChangeEvent, DragEvent, useRef, useState} from "react";
import {toast} from "react-toastify";

export function AddSignatureCard() {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSubmit = (files: FileList) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image"))
      toast.warning(
        "Apenas arquivos de imagem podem ser adicionados como assinaturas"
      );

    const userId = getUserId();
    if (!userId) return;

    setIsLoading(true);
    const body = new FormData();

    body.append("userId", userId);
    body.append("signature", file);

    api
      .post("signatures/assets/upload", body)
      .then((response) => {
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
        <div>
          <svg
            aria-hidden="true"
            className="w-16 h-16 mr-2 text-gray-200 animate-spin fill-orange-300"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
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
