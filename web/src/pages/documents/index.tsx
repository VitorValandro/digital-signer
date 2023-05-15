import PDFDocument from "@/components/PDFDocument";
import Sidebar from "../../components/Sidebar";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-16 sm:ml-64">
        <div className="p-4 flex items-center mt-5"></div>
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-5">
          <PDFDocument
            setCurrentPage={() => {}}
            setPositions={() => {}}
            documentUrl={
              "https://mega.nz/file/4EN21bZJ#L-BSTZC5tzRqi-V-9BfWh93gyAZO_v-8iVUL_iCmRd0"
            }
          />
        </div>
      </div>
    </>
  );
}
