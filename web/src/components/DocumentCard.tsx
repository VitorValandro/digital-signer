"use client";
import {useEffect, useState} from "react";

interface DocumentCardProps {
  progress: number;
}

export default function DocumentCard({progress}: DocumentCardProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(progress);
  }, [progress]);

  return (
    <div className="flex flex-col justify-between h-32 mb-4 rounded bg-gray-50 dark:bg-gray-800 p-3">
      <div className="flex flex-col">
        <h1 className="text-xl font-medium">Título do documento</h1>
        <h3 className="text-sm text-gray-400 font-medium">
          Criado por Vitor Valandro em 10/05/2023
        </h3>
      </div>
      <div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="w-0 transition-width duration-1000 ease-in-out bg-orange-500 h-2.5 rounded-full"
            style={{width: `${width}%`}}
          ></div>
        </div>
        <div className="flex justify-between">
          <span className="text-base font-normal dark:text-white">
            Assinaturas
          </span>
          <span className="text-sm font-medium dark:text-white">1/3</span>
        </div>
      </div>
    </div>
  );
}
