import { Session } from "next-auth";
import BoardSettings from "./BoardSettings";
import CreateTask from "./CreateTask";
import { Button } from "./ui/button";
import { useModal } from "~/lib/hooks/useModal";
import { useToast } from "./ui/use-toast";

interface Props {
  boardName: string;
  userSession: Session;
  hasColumns: boolean;
}

export default function BoardHeader({
  boardName,
  userSession,
  hasColumns,
}: Props) {
  const onCreateTaskOpen = useModal((state) => state.onOpen);
  const { toast } = useToast();

  function openModal() {
    if (!hasColumns) {
      return toast({
        variant: "destructive",
        description: "Create a column first",
      });
    }
    onCreateTaskOpen("createTask");
  }

  return (
    <header className="flex items-center justify-between border-0 border-b border-solid border-main-border bg-main-background px-5 py-3.5">
      <h2 className="text-2xl font-semibold text-primary">{boardName}</h2>

      <div className="flex items-center gap-x-3">
        <Button
          onClick={openModal}
          type="button"
          size="full"
          variant="purple"
          className="h-12 px-5 text-base font-semibold capitalize"
        >
          + add new task
        </Button>
        <BoardSettings userSession={userSession} />
      </div>
    </header>
  );
}
