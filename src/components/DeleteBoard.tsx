import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog";
import { useDeleteBoard } from "~/lib/hooks/use-delete-board";

export default function DeleteBoard() {
  const [isOpen, onClose] = useDeleteBoard((state) => [
    state.isOpen,
    state.onClose,
  ]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      {/* <AlertDialogTrigger asChild>
        <span>Delete Board</span>
      </AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this board?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "Platform Launch" board? This
            action will remove all columns and tasks and cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="flex-grow">Delete</AlertDialogAction>
          <AlertDialogCancel className="flex-grow">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
