import DocumentCard from "../components/DocumentCard";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import {fetcher} from "@/services/api";

import useSWR from "swr";

type DocumentByUser = {
  id: string;
  createdAt: string;
  owner: {
    name: string;
  };
  signatures: {
    isSigned: boolean;
    signedAt?: string;
    signee: {
      id: string;
      name: string;
    };
  }[];
}[];

export default function Home() {
  const {data, error, isLoading} = useSWR<DocumentByUser>("document", fetcher);

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 flex items-center mt-5">
          <h1 className="text-4xl font-light text-slate-800">
            Seus documentos
          </h1>
          <button>
            <Link href="/documents/create">Novo</Link>
          </button>
        </div>
        <div className="min-h-screen p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
          {data &&
            data.map((document) => {
              return (
                <DocumentCard
                  key={document.id}
                  {...{
                    id: document.id,
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
