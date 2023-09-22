import { MoreVertical } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { useModal } from "~/lib/hooks/useModal";
import { avatarFallback } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Props {
  userSession: Session;
}

export default function BoardSettings({ userSession }: Props) {
  const onModalOpen = useModal((state) => state.onOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-7 w-7 cursor-pointer text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 bg-board-background">
        <DropdownMenuLabel>
          <Avatar className="mx-auto">
            <AvatarImage
              src={userSession.user.image ?? undefined}
              alt="user avatar"
            />
            <AvatarFallback>
              {avatarFallback(userSession.user.name!)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onModalOpen("editBoard")}>
            Edit Board
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={() => onModalOpen("deleteBoard")}
          >
            Delete Board
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => void signOut()}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
