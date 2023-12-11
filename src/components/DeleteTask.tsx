// import {
//   AlertDialog,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "src/components/ui/alert-dialog";
// import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { api } from "~/lib/api";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";

interface Props {
  taskTitle: string;
  taskId: string;
  openDeleteModal: boolean;
  setOpenDeleteModal: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteTask({
  taskTitle,
  taskId,
  openDeleteModal,
  setOpenDeleteModal,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useContext();

  const { mutate: deleteTask, isLoading } = api.task.deleteTask.useMutation({
    onSuccess: (data) => {
      toast({
        description: "Successfully deleted",
      });
      utils.board.getSingleBoard.setData(
        { boardID: router.query.id as string },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            boardColumns: [
              ...old.boardColumns.map((b) =>
                b.id === data.boardColumn.id
                  ? { ...b, tasks: [...b.tasks.filter((t) => t.id !== taskId)] }
                  : b
              ),
            ],
          };
        }
      );
      setOpenDeleteModal(false);
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
    // <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
    //   <AlertDialogContent>
    //     <AlertDialogHeader>
    //       <AlertDialogTitle>Delete this task?</AlertDialogTitle>
    //       <AlertDialogDescription>
    //         Are you sure you want to delete the {'"' + taskTitle + '"'} task and
    //         its subtasks? This action cannot be reversed.
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <Button
    //         disabled={isLoading}
    //         variant="destructive"
    //         size="full"
    //         onClick={() => deleteTask({ taskId })}
    //         className="flex-grow"
    //       >
    //         {isLoading ? (
    //           <>
    //             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    //             Deleting
    //           </>
    //         ) : (
    //           "Delete"
    //         )}
    //       </Button>
    //       <AlertDialogCancel className="flex-grow">Cancel</AlertDialogCancel>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
    <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
      <DialogContent className="bg-main-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this task?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the {'"' + taskTitle + '"'} task and
            its subtasks? This action cannot be reversed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-y-2">
          <Button
            disabled={isLoading}
            variant="destructive"
            size="full"
            onClick={() => deleteTask({ taskId })}
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
          <Button
            size="full"
            onClick={() => setOpenDeleteModal(false)}
            className="flex-grow"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
