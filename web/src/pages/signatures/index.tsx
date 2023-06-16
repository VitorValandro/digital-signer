import useSWR from "swr";
import Sidebar from "../../components/Sidebar";
import {SignatureCard} from "../../components/SignatureCard";
import {fetcher} from "@/services/api";
import {AddSignatureCard} from "@/components/AddSignatureCard";

export default function Home() {
  const {data, error, isLoading} = useSWR<SignatureAsset[]>(
    "/signatures/assets/",
    fetcher
  );

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 flex items-center mt-5">
          <h1 className="text-4xl font-light text-slate-800">
            Suas assinaturas
          </h1>
        </div>
        <div className="p-4 mt-5">
          <div className="grid justify-items-stretch grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mb-4">
            <AddSignatureCard />
            {data &&
              data.map((signature) => {
                return (
                  <SignatureCard
                    key={signature.id}
                    id={signature.id}
                    signatureUrl={signature.signatureUrl}
                    createdAt={signature.createdAt}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
