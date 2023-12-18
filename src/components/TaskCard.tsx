import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { z } from "zod";
import TaskSettings from "./TaskSettings";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { api } from "~/lib/api";
import { useToast } from "./ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRouter } from "next/router";
import DeleteTask from "./DeleteTask";
import EditTask from "./EditTask";

const formSchema = z.object({
  status: z.string(),
  subtasks: z
    .object({ completed: z.boolean(), id: z.string(), title: z.string() })
    .array(),
});

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  taskId: string;
  taskTitle: string;
}

export default function TaskCard({ open, setOpen, taskId, taskTitle }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useContext();
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const { data, isLoading, error } = api.task.getTaskDetail.useQuery({
    taskId,
    boardId: router.query.id as string,
  });

  const { mutate: saveTask, isLoading: savingTask } =
    api.task.saveTaskDetail.useMutation({
      onSuccess: (newData, variables) => {
        toast({
          description: "Successfully updated",
        });
        setOpen(false);
        utils.task.getTaskDetail.setData(
          { taskId: newData.id, boardId: router.query.id as string },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              taskDetail: {
                ...old.taskDetail,
                subTasks: [...newData.subTasks],
                boardColumn: { id: newData.boardColumn.id },
              },
            };
          }
        );
        if (
          data &&
          (data.taskDetail.boardColumn.id !== newData.boardColumn.id ||
            variables.subtasks.length)
        ) {
          void utils.board.getSingleBoard.invalidate({
            boardID: router.query.id as string,
          });
        }
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Server error. Please try again later",
        });
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { fields } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "subtasks", // unique name for Field Array
  });

  useEffect(() => {
    if (!data) return;

    form.setValue("subtasks", data.taskDetail.subTasks);

    form.setValue("status", data.taskDetail.boardColumn.id);
  }, [data, form]);

  if (error) console.log(error);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!data) return;

    const currentSubtasks: Record<string, boolean> = {};

    data.taskDetail.subTasks.forEach((st) => {
      currentSubtasks[st.id] = st.completed;
    });

    const subtasksToUpdate = values.subtasks.filter(
      (st) => st.completed !== currentSubtasks[st.id]
    );

    if (
      !subtasksToUpdate.length &&
      values.status === data.taskDetail.boardColumn.id
    )
      return setOpen(false);

    saveTask({
      taskId,
      columnId:
        values.status === data.taskDetail.boardColumn.id
          ? undefined
          : values.status,
      subtasks: subtasksToUpdate,
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
          {isLoading ? (
            <Loader2 className="w-6 h-6 mx-auto my-3 animate-spin" />
          ) : data ? (
            <>
              <header className="flex items-center justify-between mt-3 gap-x-2">
                <DialogHeader>
                  <DialogTitle>{data.taskDetail.title}</DialogTitle>
                  <DialogDescription>
                    {data.taskDetail.description}
                  </DialogDescription>
                </DialogHeader>
                <TaskSettings
                  setOpenDeleteModal={setOpenDeleteModal}
                  setOpenEditModal={setOpenEditModal}
                />
              </header>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-2.5 space-y-4"
                >
                  <div>
                    <p className="mb-3 text-sm font-semibold tracking-widest text-gray-400">
                      Subtasks (
                      {
                        data.taskDetail.subTasks.filter((s) => s.completed)
                          .length
                      }{" "}
                      of {data.taskDetail.subTasks.length})
                    </p>

                    <fieldset className="space-y-2">
                      {fields.map((st, idx) => (
                        <FormField
                          key={st.id}
                          control={form.control}
                          name={`subtasks.${idx}.completed`}
                          render={({ field }) => (
                            <FormItem className="flex items-center p-3 space-x-2 space-y-0 rounded-sm bg-board-background hover:bg-main-color/20 dark:hover:bg-main-color/30">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:border-main-color data-[state=checked]:bg-main-color data-[state=checked]:text-white"
                                />
                              </FormControl>
                              <FormLabel className="text-[0.82rem] leading-none decoration-[1.5px] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-aria-checked:text-gray-400 peer-aria-checked:line-through">
                                {st.title}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </fieldset>
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={data.taskDetail.boardColumn.id}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              {data.boardColumns.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="sm:flex-col sm:space-x-0">
                    <Button
                      disabled={savingTask}
                      type="submit"
                      size="full"
                      variant="purple"
                      className="w-full font-bold capitalize"
                    >
                      {savingTask ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          saving
                        </>
                      ) : (
                        "save changes"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
            <Alert variant="destructive" className="h-fit bg-board-background">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <DeleteTask
        openDeleteModal={openDeleteModal}
        setOpenDeleteModal={setOpenDeleteModal}
        taskTitle={taskTitle}
        taskId={taskId}
      />

      <EditTask
        open={openEditModal}
        setOpen={setOpenEditModal}
        taskDetail={data?.taskDetail}
        boardColumns={data?.boardColumns}
      />
    </>
  );
}
