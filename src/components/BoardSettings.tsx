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

export default function BoardSettings() {
  const onOpen = useDeleteBoard((state) => state.onOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-7 w-7 cursor-pointer text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 bg-board-background">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Edit Board</DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={onOpen}
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
