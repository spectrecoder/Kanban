import { MoreVertical } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

interface Props {
  setOpenDeleteModal: Dispatch<SetStateAction<boolean>>;
  setOpenEditModal: Dispatch<SetStateAction<boolean>>;
}

export default function TaskSettings({
  setOpenDeleteModal,
  setOpenEditModal,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="w-6 h-6 text-gray-400 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 bg-board-background">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setOpenEditModal(true)}>
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setOpenDeleteModal(true)}
          className="text-red-500 focus:text-red-500"
        >
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
