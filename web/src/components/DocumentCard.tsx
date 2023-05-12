"use client";
import {useEffect, useState} from "react";

interface DocumentCardProps {
  progress: number;
}

export default function DocumentCard({progress}: DocumentCardProps) {
  const [width, setWidth] = useState(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  useEffect(() => {
    setWidth(progress);
  }, [progress]);

  return (
    <div className="flex flex-col justify-between mb-4 rounded bg-gradient-to-t from-slate-100 to-slate-50 dark:bg-gray-800 border border-gray-200 rounded-lg shadow dark:border-gray-700 p-3">
      <div className="flex flex-col mb-4">
        <h1 className="text-xl font-medium text-slate-800">
          Título do documento
        </h1>
        <h3 className="text-sm text-slate-400 font-medium">
          Criado por Vitor Valandro em 10/05/2023
        </h3>
      </div>

      <div>
        <div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
            <div
              className="w-0 transition-width duration-1000 ease-in-out bg-orange-500 h-2.5 rounded-full"
              style={{width: `${width}%`}}
            ></div>
          </div>
          <div className="flex justify-between">
            <span className="text-base text-slate-700 font-normal dark:text-white">
              Assinaturas
            </span>
            <span className="text-sm text-slate-700 font-medium dark:text-white">
              1/3
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={toggleAccordion}
            className="flex items-center justify-center w-full pb-3 font-medium text-left text-gray-500 dark:text-gray-400"
            aria-expanded="true"
          >
            <svg
              className={`"w-6 h-6 transition-transform transform duration-500 ${
                isAccordionOpen && "rotate-180"
              } shrink-0`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <div
            className={`transition-all duration-300 ease-in-out w-full ${
              isAccordionOpen
                ? "h-24 overflow-y-scroll scrollbar-hide"
                : "h-0 overflow-hidden"
            }`}
            aria-labelledby="accordion-flush-heading-1"
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 sm:px-10">
              <li>
                <div className="flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="w-5 h-5 stroke-orange-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>

                  <div className="ml-4">
                    <h3 className="text-sm text-slate-700 p-0 m-0">
                      Marcos Aurélio
                    </h3>
                    <h4 className="text-xs text-slate-400 p-0 m-0">
                      Assinatura pendente
                    </h4>
                  </div>
                </div>
              </li>
              <div className="flex flex-row items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  className="w-5 h-5 stroke-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <div className="ml-4">
                  <h3 className="text-sm text-slate-700 p-0 m-0">
                    Fiódor Dostoiévski
                  </h3>
                  <h4 className="text-xs text-slate-400 p-0 m-0">
                    Assinado 10/05/2023
                  </h4>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
