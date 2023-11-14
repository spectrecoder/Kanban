import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import * as z from "zod";
import { Textarea } from "./ui/textarea";
import { Dispatch, SetStateAction, useEffect } from "react";
import { RouterOutputs, api } from "~/lib/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/router";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  taskDetail: RouterOutputs["task"]["getTaskDetail"]["taskDetail"] | undefined;
  boardColumns:
    | RouterOutputs["task"]["getTaskDetail"]["boardColumns"]
    | undefined;
}

const formSchema = z.object({
  taskName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  description: z
    .string()
    .max(150, { message: "Must be 150 or fewer characters long" }),
  status: z.string(),
  subtasks: z.object({ title: z.string(), id: z.string().optional() }).array(),
});

export default function EditTask({
  open,
  setOpen,
  taskDetail,
  boardColumns,
}: Props) {
  const [subtasksParent] = useAutoAnimate();
  const { toast } = useToast();
  const utils = api.useContext();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: taskDetail?.title ?? "",
      description: taskDetail?.description ?? "",
      status: taskDetail?.boardColumn.id ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "subtasks", // unique name for Field Array
  });

  const { mutate: editTask, isLoading: editingTask } =
    api.task.editTask.useMutation({
      onSuccess: (data) => {
        toast({
          description: "Updated task",
        });
        setOpen(false);
        utils.task.getTaskDetail.setData(
          {
            taskId: data.id,
            boardId: router.query.id as string,
          },
          (old) => {
            if (!old) return old;
            return { ...old, taskDetail: data };
          }
        );
        utils.board.getSingleBoard.invalidate({
          boardID: router.query.id as string,
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Server error. Please try again later",
        });
      },
    });

  useEffect(() => {
    if (!taskDetail || !open) return;
    form.setValue(
      "subtasks",
      taskDetail.subTasks.map((st) => ({
        title: st.title,
        id: st.id,
      }))
    );
  }, [taskDetail, open]);

  useEffect(() => {
    if (!taskDetail || !open) return;

    form.setValue("taskName", taskDetail.title);
    form.setValue("description", taskDetail.description ?? "");
    form.setValue("status", taskDetail.boardColumn.id);
  }, [
    taskDetail?.title,
    taskDetail?.description,
    taskDetail?.boardColumn.id,
    open,
  ]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!taskDetail) return;

    console.log(values);

    const filterOutEmptyInputs = values.subtasks.filter((st) => !!st.title);

    const subtasksWithId = values.subtasks.filter((st) => !!st.id);

    const formattedSubtasks: Record<string, string> = {};
    taskDetail.subTasks.forEach((st) => (formattedSubtasks[st.id] = st.title));

    //? create
    const createSubtasks = filterOutEmptyInputs.filter((st) => !st.id);

    //* update
    const updateSubtasks = subtasksWithId.filter(
      (st) => st.title && st.title !== formattedSubtasks[st.id as string]
    ) as { title: string; id: string }[];

    //! delete
    const subtasksArrayWithOnlyId = subtasksWithId.map((st) => st.id as string);
    const deleteSubtasks = Object.entries(formattedSubtasks)
      .filter((st) => !subtasksArrayWithOnlyId.includes(st[0]))
      .map((st) => st[0]);

    if (
      values.taskName === taskDetail.title &&
      createSubtasks.length === 0 &&
      updateSubtasks.length === 0 &&
      deleteSubtasks.length === 0 &&
      values.status === taskDetail.boardColumn.id &&
      values.description === taskDetail.description
    )
      return setOpen(false);

    editTask({
      taskId: taskDetail.id,
      columnId:
        values.status === taskDetail.boardColumn.id ? undefined : values.status,
      taskTitle:
        values.taskName === taskDetail.title ? undefined : values.taskName,
      taskDescription:
        values.description === taskDetail.description
          ? undefined
          : values.description,
      deleteSubtasks,
      updateSubtasks,
      createSubtasks,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Take coffee break"
                      {...field}
                      className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. It's always good to take a break. This  15 minute break will  recharge the batteries  a little."
                      {...field}
                      className="h-28 cursor-pointer resize-none outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="grid w-full gap-2.5">
              <Label>Subtasks</Label>
              <div ref={subtasksParent} className="space-y-2.5">
                {fields.map((st, idx) => (
                  <FormField
                    key={st.id}
                    control={form.control}
                    name={`subtasks.${idx}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-x-2">
                            <Input
                              {...field}
                              className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <X
                              onClick={() => remove(idx)}
                              className="h-7 w-7 cursor-pointer text-gray-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </fieldset>

            <Button
              onClick={() => append({ title: "" })}
              type="button"
              size="full"
              className="w-full font-bold capitalize text-white dark:text-main-color"
            >
              + add new subtask
            </Button>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status</FormLabel>
                  <Select
                    defaultValue={taskDetail?.boardColumn.id}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        {boardColumns?.map((c) => (
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
                type="submit"
                size="full"
                variant="purple"
                disabled={editingTask}
                className="w-full font-bold capitalize"
              >
                {editingTask ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    editing
                  </>
                ) : (
                  "edit task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
