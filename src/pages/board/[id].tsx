import { cn } from "~/lib/utils";
import BoardHeader from "~/components/BoardHeader";
import TasksGroup from "~/components/TasksGroup";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import NewColumn from "~/components/NewColumn";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerAuthSession } from "~/server/auth";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import superjson from "superjson";
import { api } from "~/lib/api";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function Board({
  userSession,
  boardID,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isSidebarOpen = useSidebar((state) => state.isOpen);

  const { data: currentBoard } = api.board.getSingleBoard.useQuery(
    { boardID },
    {
      enabled: !!userSession,
    }
  );

  const [boardColumnsParent] = useAutoAnimate();

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

  return (
    <section className="flex-grow bg-board-background">
      <BoardHeader boardName={currentBoard.title} userSession={userSession} />

      <ScrollArea
        direction="horizontal"
        className={cn(
          "w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] transition-all duration-300",
          !isSidebarOpen && "w-screen max-w-[100vw]"
        )}
      >
        <div className="flex h-[calc(100vh-76.8px)] gap-x-6 overflow-y-auto p-5 scrollbar-none">
          <main className="flex h-fit gap-x-6">
            <div className="flex h-full gap-x-6" ref={boardColumnsParent}>
              {currentBoard.boardColumns.map((bc) => (
                <TasksGroup key={bc.id} boardColumn={bc} />
              ))}
            </div>

            <NewColumn />
          </main>
        </div>
      </ScrollArea>
    </section>
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
