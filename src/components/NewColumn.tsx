import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import * as z from "zod";
import { api } from "~/lib/api";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useModal } from "~/lib/hooks/useModal";

const formSchema = z.object({
  columnName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
});

export default function NewColumn() {
  const { toast } = useToast();
  const utils = api.useContext();
  const router = useRouter();
  const [type, onClose] = useModal((state) => [state.type, state.onClose]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: "",
    },
  });

  const { mutate: createColumn, isLoading: creatingColumn } =
    api.board.createColumn.useMutation({
      onSuccess: (data) => {
        utils.board.getSingleBoard.setData(
          { boardID: router.query.id as string },
          (old) => {
            if (!old) return old;

            const allTasks = old.boardColumns.flatMap((b) => b.tasks);

            allTasks.map((t) =>
              utils.task.getTaskDetail.setData(
                { boardId: router.query.id as string, taskId: t.id },
                (old) => {
                  if (!old) return old;
                  return {
                    ...old,
                    boardColumns: [
                      ...old.boardColumns,
                      { id: data.id, title: data.title },
                    ],
                  };
                }
              )
            );

            return {
              ...old,
              boardColumns: [...old.boardColumns, { ...data, tasks: [] }],
            };
          }
        );

        // utils.task.getTaskDetail.invalidate({
        //   boardId: router.query.id as string,
        // });

        toast({
          description: "Successfully created new column",
        });

        onClose();
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Server error. Please try again later",
        });
      },
    });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createColumn({
      columnName: values.columnName,
      boardId: router.query.id as string,
    });
  }

  return (
    <Dialog open={type === "createColumn"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Column</DialogTitle>
          <DialogDescription>
            Create a new column for your current board
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="columnName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={creatingColumn}
                type="submit"
                size="full"
                variant="purple"
                className="w-full font-bold capitalize"
              >
                {creatingColumn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    creating
                  </>
                ) : (
                  "create new column"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
