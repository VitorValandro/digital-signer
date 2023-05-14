import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // atualiza o estado na primeira chamada
    handleResize();

    // remove o eventListener quando componente é limpo
    return () => window.removeEventListener("resize", handleResize);
  }, []); // roda somente na montagem do componente
  return windowSize;
}