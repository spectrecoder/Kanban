import BoardHeader from "./BoardHeader";

export default function Board() {
  return (
    <section className="flex-grow basis-[calc(100%-16rem)] bg-board-background">
      <BoardHeader />
    </section>
  );
}
