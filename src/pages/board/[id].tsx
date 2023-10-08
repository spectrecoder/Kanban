import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { AlertCircle } from "lucide-react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import superjson from "superjson";
import BoardHeader from "~/components/BoardHeader";
import CreateTask from "~/components/CreateTask";
import DeleteBoard from "~/components/DeleteBoard";
import EditBoard from "~/components/EditBoard";
import NewColumn from "~/components/NewColumn";
import Task from "~/components/Task";
import TasksGroup from "~/components/TasksGroup";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RouterOutputs, api } from "~/lib/api";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import { useModal } from "~/lib/hooks/useModal";
import { cn } from "~/lib/utils";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";

export default function Board({
  userSession,
  boardID,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isSidebarOpen = useSidebar((state) => state.isOpen);
  const onOpen = useModal((state) => state.onOpen);
  const [activeColumn, setActiveColumn] = useState<
    RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number] | null
  >(null);
  const [activeTask, setActiveTask] = useState<{
    task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
    columnId: string;
  } | null>(null);
  const utils = api.useContext();

  const { data: currentBoard } = api.board.getSingleBoard.useQuery(
    { boardID },
    {
      enabled: !!userSession,
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const [boardColumnsParent] = useAutoAnimate();

  const columnsID = useMemo(
    () => currentBoard?.boardColumns.map((bc) => bc.id) || [],
    [currentBoard]
  );

  if (!currentBoard) {
    return (
      <Alert variant="destructive" className="m-4 h-fit bg-board-background">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Board not found. Please enter a valid board id.
        </AlertDescription>
      </Alert>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      return setActiveColumn(event.active.data.current.column);
    }

    if (event.active.data.current?.type === "Task") {
      return setActiveTask({
        task: event.active.data.current.task,
        columnId: event.active.data.current.columnId,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return; //?
    console.log("after");

    utils.board.getSingleBoard.setData({ boardID }, (old) => {
      if (!old) return old;
      const activeColumnIndex = old.boardColumns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = old.boardColumns.findIndex(
        (col) => col.id === overColumnId
      );

      return {
        ...old,
        boardColumns: arrayMove(
          old.boardColumns,
          activeColumnIndex,
          overColumnIndex
        ),
      };
    });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      const activeTaskColumnId = active.data.current?.columnId;
      const overTaskColumnId = over.data.current?.columnId;

      utils.board.getSingleBoard.setData({ boardID }, (old) => {
        if (!old) return old;

        let currentColumn;

        if (activeTaskColumnId === overTaskColumnId) {
          currentColumn = old.boardColumns.find(
            (b) => b.id === activeTaskColumnId
          );
        } else {
          currentColumn = old.boardColumns.find(
            (b) => b.id === overTaskColumnId
          );
        }

        if (!currentColumn) return old;

        if (activeTaskColumnId === overTaskColumnId) {
          const overTaskIndex = currentColumn.tasks.findIndex(
            (t) => t.id === overId
          );
          const activeTaskIndex = currentColumn.tasks.findIndex(
            (t) => t.id === activeId
          );
          return {
            ...old,
            boardColumns: [
              ...old.boardColumns.map((b) =>
                b.id === activeTaskColumnId
                  ? {
                      ...b,
                      tasks: arrayMove(b.tasks, activeTaskIndex, overTaskIndex),
                    }
                  : b
              ),
            ],
          };
        } else {
          const activeColumn = old.boardColumns.find(
            (b) => b.id === activeTaskColumnId
          );
          const overColumn = old.boardColumns.find(
            (b) => b.id === overTaskColumnId
          );

          if (!activeColumn || !overColumn) return old;

          const activeTask = active.data.current?.task;

          const activeColumnTasks = activeColumn.tasks.filter(
            (t) => t.id !== activeId
          );
          let overColumnTasks = [activeTask, ...overColumn.tasks];
          const overTaskIndex = overColumnTasks.findIndex(
            (t) => t.id === overId
          );
          overColumnTasks = arrayMove(overColumnTasks, 0, overTaskIndex - 1); //?

          return {
            ...old,
            boardColumns: [
              ...old.boardColumns.map((b) =>
                b.id === activeTaskColumnId
                  ? {
                      ...b,
                      tasks: activeColumnTasks,
                    }
                  : b.id === overTaskColumnId
                  ? { ...b, tasks: overColumnTasks }
                  : b
              ),
            ],
          };
        }
      });
    }
  }

  return (
    <>
      <section className="flex-grow bg-board-background">
        <BoardHeader
          hasColumns={!!currentBoard.boardColumns.length}
          boardName={currentBoard.title}
          userSession={userSession}
        />

        <ScrollArea
          direction="horizontal"
          className={cn(
            "w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] transition-all duration-300",
            !isSidebarOpen && "w-screen max-w-[100vw]"
          )}
        >
          <div className="flex h-[calc(100vh-76.8px)] gap-x-6 overflow-y-auto p-5 scrollbar-none">
            <main className="flex h-fit gap-x-6">
              <DndContext
                id="columnsContext"
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <div className="flex h-full gap-x-6" ref={boardColumnsParent}>
                  <SortableContext
                    items={columnsID}
                    strategy={horizontalListSortingStrategy}
                  >
                    {currentBoard.boardColumns.map((bc) => (
                      <TasksGroup key={bc.id} boardColumn={bc} />
                    ))}
                  </SortableContext>
                </div>

                <aside
                  onClick={() => onOpen("createColumn")}
                  className="mt-9 flex max-h-[813px] min-h-[572.2px] w-[17.5rem] shrink-0 cursor-pointer items-center justify-center rounded-md bg-sky-100/60 text-[1.65rem] font-semibold capitalize text-gray-600 hover:text-main-color dark:bg-main-background/40 dark:text-gray-500 dark:hover:text-main-color"
                >
                  + new column
                </aside>

                {typeof window !== "undefined" &&
                  createPortal(
                    <DragOverlay>
                      {activeColumn ? (
                        <TasksGroup boardColumn={activeColumn} />
                      ) : null}

                      {activeTask ? <Task {...activeTask} /> : null}
                    </DragOverlay>,
                    document.body
                  )}
              </DndContext>
            </main>
          </div>
        </ScrollArea>
      </section>

      <CreateTask
        boardId={currentBoard.id}
        columns={currentBoard.boardColumns.map((c) => ({
          id: c.id,
          title: c.title,
        }))}
      />

      <EditBoard
        boardDetails={{
          title: currentBoard.title,
          id: currentBoard.id,
          boardColumns: currentBoard.boardColumns.map((c) => ({
            id: c.id,
            title: c.title,
          })),
        }}
      />

      <DeleteBoard boardTitle={currentBoard.title} />

      <NewColumn />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userSession = (await getServerAuthSession(context))!;

  if (context.params === undefined) {
    return {
      notFound: true,
    };
  }

  const boardID = context.params.id as string;

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: userSession }),
    transformer: superjson,
  });

  await ssg.board.getSingleBoard.prefetch({ boardID });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userSession,
      boardID,
    },
  };
}
