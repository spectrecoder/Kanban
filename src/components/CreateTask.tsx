import { useAutoAnimate } from "@formkit/auto-animate/react";
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
} from "src/components/ui/dialog";
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
import { RouterOutputs, api } from "~/lib/api";
import { useModal } from "~/lib/hooks/useModal";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";

interface Props {
  columns: Pick<
    RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number],
    "id" | "title"
  >[];
  boardId: string;
}

const formSchema = z.object({
  taskName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  description: z
    .string()
    .max(150, { message: "Must be 150 or fewer characters long" })
    .optional(),
  status: z.string(),
  subtasks: z
    .object({ title: z.string() })
    .array()
    .transform((values) => values.filter((v) => v.title)),
});

export default function CreateTask({ columns, boardId }: Props) {
  const [type, onClose] = useModal((state) => [state.type, state.onClose]);
  const [subtasksParent] = useAutoAnimate();
  const { toast } = useToast();
  const utils = api.useContext();

  const { mutate: createTask, isLoading: creatingTask } =
    api.task.create.useMutation({
      onSuccess: (data, variables) => {
        toast({
          description: "Task created",
        });
        form.setValue("subtasks", [{ title: "" }, { title: "" }]);
        form.setValue("taskName", "");
        form.setValue("description", "");
        onClose();
        utils.board.getSingleBoard.setData(
          {
            boardID: boardId,
          },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              boardColumns: [
                ...old.boardColumns.map((b) =>
                  b.id === variables.columnId
                    ? { ...b, tasks: [...b.tasks, data] }
                    : b
                ),
              ],
            };
          }
        );
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
    defaultValues: {
      taskName: "",
      description: "",
      status: columns[0]?.id,
      subtasks: [{ title: "" }, { title: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "subtasks", // unique name for Field Array
  });

  useEffect(() => {
    if (columns[0] === undefined) return;
    form.setValue("status", columns[0].id);
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createTask({
      title: values.taskName,
      description: values.description,
      columnId: values.status,
      subtasks: values.subtasks,
    });
  }

  return (
    <Dialog open={type === "createTask"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new task</DialogTitle>
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
                      className="cursor-pointer resize-none h-28 outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
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
                              className="text-gray-400 cursor-pointer h-7 w-7"
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
              className="w-full font-bold text-white capitalize dark:text-main-color"
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
                    onValueChange={field.onChange}
                    defaultValue={columns[0]?.id}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        {columns.map((c) => (
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
                disabled={creatingTask}
                type="submit"
                size="full"
                variant="purple"
                className="w-full font-bold capitalize"
              >
                {creatingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    creating
                  </>
                ) : (
                  "create task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
