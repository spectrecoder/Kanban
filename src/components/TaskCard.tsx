import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const formSchema = z.object({
  status: z.string(),
  subtasks: z.object({ completed: z.boolean(), id: z.string() }).array(),
});

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  taskId: string;
}

export default function TaskCard({ open, setOpen, taskId }: Props) {
  const router = useRouter();

  const { data, isLoading, error } = api.task.getTaskDetail.useQuery({
    taskId,
    boardId: router.query.id as string,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "todo",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "subtasks", // unique name for Field Array
  });

  useEffect(() => {
    if (!data) return;

    form.setValue(
      "subtasks",
      data.taskDetail.subTasks.map((st) => ({
        id: st.id,
        completed: st.completed,
      }))
    );
  }, [data]);

  if (error) console.log(error);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        {isLoading ? (
          <Loader2 className="mx-auto my-3 h-6 w-6 animate-spin" />
        ) : data ? (
          <>
            <header className="mt-3 flex items-center justify-between gap-x-2">
              <DialogHeader>
                <DialogTitle>{data.taskDetail.title}</DialogTitle>
                <DialogDescription>
                  {data.taskDetail.description}
                </DialogDescription>
              </DialogHeader>
              <TaskSettings />
            </header>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-2.5 space-y-4"
              >
                <div>
                  <p className="mb-3 text-sm font-semibold tracking-widest text-gray-400">
                    Subtasks (
                    {data.taskDetail.subTasks.filter((s) => s.completed).length}{" "}
                    of {data.taskDetail.subTasks.length})
                  </p>

                  <fieldset className="space-y-2">
                    {fields.map((st, idx) => (
                      <FormField
                        key={st.id}
                        control={form.control}
                        name={`subtasks.${idx}.completed`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0 rounded-sm bg-board-background p-3 hover:bg-main-color/20 dark:hover:bg-main-color/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:border-main-color data-[state=checked]:bg-main-color data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <FormLabel className="text-[0.82rem] leading-none decoration-[1.5px] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-aria-checked:text-gray-400 peer-aria-checked:line-through">
                              Accept terms and conditions
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
                        defaultValue="todo"
                      >
                        <FormControl>
                          <SelectTrigger className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="doing">Doing</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
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
                    className="w-full font-bold capitalize"
                  >
                    save changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <Alert variant="destructive" className="h-fit bg-board-background">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again later.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
