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
import { useDeleteTask } from "~/lib/hooks/use-delete-task";

export default function DeleteTask() {
  const [isOpen, onClose] = useDeleteTask((state) => [
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
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "Build UI for onboarding flow"
            task and its subtasks? This action cannot be reversed.
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
