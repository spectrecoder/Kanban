import { cn } from "~/lib/utils";
import BoardHeader from "./BoardHeader";
import TasksGroup from "./TasksGroup";
import { ScrollArea } from "./ui/scroll-area";
import { useSidebar } from "~/lib/hooks/use-sidebar";

export default function Board() {
  const isSidebarOpen = useSidebar((state) => state.isOpen);

  return (
    <section className="flex-grow bg-board-background">
      <BoardHeader />

      <ScrollArea
        direction="horizontal"
        className={cn(
          "w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] transition-all duration-300",
          !isSidebarOpen && "w-screen max-w-[100vw]"
        )}
      >
        <div className="flex h-[calc(100vh-76.8px)] gap-x-6 overflow-y-auto p-5 scrollbar-none">
          <main className="flex h-fit gap-x-6">
            <div className="flex h-full gap-x-6">
              <TasksGroup />
              <TasksGroup />

              <TasksGroup />
              <TasksGroup />

              <TasksGroup />
            </div>
            <aside className="mt-9 flex max-h-[813px] min-h-[572.2px] w-[17.5rem] shrink-0 cursor-pointer items-center justify-center rounded-md bg-sky-100/60 text-[1.65rem] font-semibold capitalize text-gray-600 hover:text-main-color dark:bg-main-background/40 dark:text-gray-500 dark:hover:text-main-color">
              + new column
            </aside>
          </main>
        </div>
      </ScrollArea>
    </section>
  );
}
