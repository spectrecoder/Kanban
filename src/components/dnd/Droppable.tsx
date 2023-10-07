import { useDroppable } from "@dnd-kit/core";

interface Props {
  children: JSX.Element;
  dropId: string;
}

export default function Droppable(props: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.dropId,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return <div ref={setNodeRef}>{props.children}</div>;
}
