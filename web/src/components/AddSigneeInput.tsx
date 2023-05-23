import {useState} from "react";
import {toast} from "react-toastify";
import {z} from "zod";

import LoadingSpinner from "./LoadingSpinner";
import {useDocumentContext} from "@/contexts/DocumentContext";
import {fetcher} from "@/services/api";

type AddSigneeInputProps = {
  close: () => void;
};

export function AddSigneeInput({close}: AddSigneeInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {addSignature} = useDocumentContext();

  const emailSchema = z
    .string()
    .email("Email inválido")
    .min(1, "Por favor preencha o email");

  const inviteUser = (event: any) => {
    event.preventDefault();
    const email = event.target?.email?.value as z.infer<typeof emailSchema>;

    try {
      emailSchema.parse(email);
    } catch (err) {
      let message = "Email inválido";
      if (err instanceof z.ZodError) {
        message = err.errors.pop()?.message || message;
      }
      toast.warning(message);

      return;
    }

    setIsLoading(true);

    fetcher(`user/${email}`)
      .then((response) => {
        setIsLoading(false);
        addSignature({email});
        close();
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        const message =
          err.response?.data?.message ||
          "Ocorreu um erro ao acessar o servidor";

        toast.warning(message);
      });
  };

  return (
    <div className="flex w-full bg-slate-100 border-2 border-dashed flex-col items-center justify-center p-5">
      <p className="text-sm">Convide um usuário para assinar o documento</p>
      <form onSubmit={inviteUser} className="flex justify-between w-full mt-2">
        <input
          type="email"
          id="email"
          placeholder="usuario@email.com"
          className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg w-4/5 p-2.5"
        />
        {isLoading ? (
          <LoadingSpinner size={8}></LoadingSpinner>
        ) : (
          <button
            type="submit"
            className="flex items-center justify-center w-1/5"
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
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
