import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { useDeleteBoard } from "~/lib/hooks/use-delete-board";
import { useEditBoard } from "~/lib/hooks/use-edit-board";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function BoardSettings() {
  const onDeleteBoardOpen = useDeleteBoard((state) => state.onOpen);
  const onEditBoardOpen = useEditBoard((state) => state.onOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-7 w-7 cursor-pointer text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 bg-board-background">
        <DropdownMenuLabel>
          <Avatar className="mx-auto">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditBoardOpen}>
            Edit Board
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={onDeleteBoardOpen}
          >
            Delete Board
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
