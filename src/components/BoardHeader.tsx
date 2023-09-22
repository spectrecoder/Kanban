import { Session } from "next-auth";
import BoardSettings from "./BoardSettings";
import CreateTask from "./CreateTask";

interface Props {
  boardName: string;
  userSession: Session;
}

export default function BoardHeader({ boardName, userSession }: Props) {
  return (
    <header className="flex items-center justify-between border-0 border-b border-solid border-main-border bg-main-background px-5 py-3.5">
      <h2 className="text-2xl font-semibold text-primary">{boardName}</h2>

      <div className="flex items-center gap-x-3">
        <CreateTask />
        <BoardSettings userSession={userSession} />
      </div>
    </header>
  );
}
