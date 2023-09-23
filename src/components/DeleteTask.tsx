import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "src/components/ui/alert-dialog";
import { useModal } from "~/lib/hooks/useModal";

export default function DeleteTask() {
  const [type, onClose] = useModal((state) => [state.type, state.onClose]);

  return (
    <AlertDialog open={type === "deleteTask"} onOpenChange={onClose}>
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
