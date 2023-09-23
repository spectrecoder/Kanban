import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { useModal } from "~/lib/hooks/useModal";

export default function TaskSettings() {
  const onOpen = useModal((state) => state.onOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-7 w-7 cursor-pointer text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 bg-board-background">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onOpen("editTask")}>
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpen("deleteTask")}
          className="text-red-500 focus:text-red-500"
        >
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
