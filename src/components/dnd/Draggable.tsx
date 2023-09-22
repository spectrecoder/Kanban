import { useDraggable } from "@dnd-kit/core";

interface Props {
  children: JSX.Element;
  dragId: string;
}

export default function Draggable(props: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.dragId,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}
