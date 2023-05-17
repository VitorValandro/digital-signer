import type { DraggableData, Rnd } from "react-rnd";

export interface ElementPositions { x: number; y: number; width: number; height: number };

export const checkPosition = (data: ElementPositions, pagePositions: DOMRect | null) => {
  if (pagePositions) {
    if (
      data.x >= pagePositions.left &&
      data.x + data.width >= pagePositions.left &&
      data.x <= pagePositions.right &&
      data.x + data.width <= pagePositions.right &&
      data.y <= pagePositions.bottom &&
      data.y + data.height <= pagePositions.bottom &&
      data.y >= pagePositions.top &&
      data.y + data.height >= pagePositions.top
    )
      return true;
    return false;
  }
};

export const checkCollision = (one: ElementPositions, other: ElementPositions) => {
  if (
    one.x < other.x + other.width &&
    one.x + one.width > other.x &&
    one.y < other.y + other.height &&
    one.y + one.height > other.y
  )
    return true;
  return false;
};

export const validateAllSignatures = (elements: Array<ElementPositions>, pagePositions: DOMRect) => {
  const colliding = (() => {
    for (let i = 0; i < elements.length; i++) {
      const one = elements[i] as ElementPositions;
      for (let j = 0; j < elements.slice(i).length; j++) {
        if (i === j) continue;

        const other = elements[j] as ElementPositions;
        if (checkCollision(one, other)) return true;
      }
    }
    return false;
  })();

  const someInvalid = elements.some(element => {
    if (!element) return false;
    return !checkPosition(element, pagePositions);
  });
  return (someInvalid || colliding);
};

export const getElementPositions = (data: DraggableData | Rnd): ElementPositions => {
  if ((data as DraggableData).node) {
    const element = data as DraggableData;
    return {
      x: element.x,
      y: element.y,
      width: element.node.offsetWidth,
      height: element.node.offsetHeight,
    };
  } else if ((data as Rnd).resizableElement.current) {
    const element = data as Rnd;
    return {
      x: element.getDraggablePosition().x,
      y: element.getDraggablePosition().y,
      width: element.resizableElement.current!.offsetWidth,
      height: element.resizableElement.current!.offsetHeight,
    };
  }
  throw new Error('Posição da assinatura inválida');
};