import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "src/components/ui/alert-dialog";
import { api } from "~/lib/api";
import { useModal } from "~/lib/hooks/useModal";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface Props {
  boardTitle: string;
}

export default function DeleteBoard({ boardTitle }: Props) {
  const [type, onClose] = useModal((state) => [state.type, state.onClose]);

  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useContext();

  const { mutate: deleteBoard, isLoading } = api.board.deleteBoard.useMutation({
    onSuccess: (data, variables) => {
      toast({
        description: data,
      });
      router.push("/");
      utils.board.getBoards.setData(undefined, (old) => {
        if (!old) return old;
        return [...old.filter((b) => b.id !== variables.boardID)];
      });
      onClose();
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "There was a problem in the server. Please try again later",
      });
    },
  });

  return (
    <AlertDialog open={type === "deleteBoard"} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this board?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{boardTitle}" board? This
            action will remove all columns and tasks and cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={isLoading}
            variant="destructive"
            size="full"
            onClick={() => deleteBoard({ boardID: router.query.id as string })}
            className="flex-grow"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              "Delete"
            )}
          </Button>
          <AlertDialogCancel className="flex-grow">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
