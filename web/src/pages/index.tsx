import DocumentCard from "../components/DocumentCard";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import {fetcher} from "@/services/api";

import useSWR from "swr";
import {useUserContext} from "@/contexts/UserContext";
import {useEffect} from "react";
import {getUserThatIsAuthenticated} from "@/services/auth";
import {toast} from "react-toastify";
import {useRouter} from "next/router";

export default function Home() {
  const {data, error, isLoading} = useSWR<DocumentByUser>("document", fetcher);
  const router = useRouter();
  const {user, setUser} = useUserContext();

  useEffect(() => {
    if (user?.id) return;
    const email = getUserThatIsAuthenticated();

    fetcher(`/user/${email}`)
        .then((response) => {
          setUser({
            ...response,
          });
        })
        .catch((err) => {
          router.push("/auth");

          toast.warning(
            "Ocorreu um problema ao recuperar sua sessão. Conecte-se novamente."
          );
        });
  }, [user, setUser, router]);

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center mt-16">
          <h1 className="text-4xl font-medium text-slate-700">
            Seus documentos
          </h1>
          <Link
            className="text-slate-600 bg-transparent disabled:text-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
            href="/documents/create"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>

            <p className="text-base">Criar um novo documento</p>
          </Link>
        </div>
        <div className="min-h-screen p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
          {data &&
            data.map((document) => {
              return (
                <DocumentCard
                  key={document.id}
                  {...{
                    id: document.id,
                    title: document.title,
                    ownerName: document.owner.name,
                    createdAt: document.createdAt,
                    signatures: document.signatures,
                  }}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}
