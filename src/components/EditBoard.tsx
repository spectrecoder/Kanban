import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/router";
import { useForm, useFieldArray } from "react-hook-form";
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
import * as z from "zod";
import { api } from "~/lib/api";
import { useEditBoard } from "~/lib/hooks/use-edit-board";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useToast } from "./ui/use-toast";
import { useModal } from "~/lib/hooks/useModal";

const formSchema = z.object({
  boardName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  boardColumns: z
    .object({ name: z.string(), columnID: z.string().optional() })
    .array(),
});

export default function EditBoard() {
  const [type, onClose] = useModal((state) => [state.type, state.onClose]);

  const [boardColumnsParent] = useAutoAnimate();

  const router = useRouter();
  const utils = api.useContext();
  const { toast } = useToast();

  const { mutate: editBoard, isLoading: editingBoard } =
    api.board.updateBoard.useMutation({
      onSuccess: (data) => {
        toast({
          description: "Updated board",
        });
        utils.board.getSingleBoard.setData(
          {
            boardID: data.id,
          },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              title: data.title,
              boardColumns: data.boardColumns,
            };
          }
        );
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

  const {
    data: boardDetails,
    isLoading,
    error,
  } = api.board.getSingleBoard.useQuery({
    boardID: router.query.id as string,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "boardColumns", // unique name for Field Array
  });

  useEffect(() => {
    if (!boardDetails || !(type === "editBoard")) return;
    form.setValue(
      "boardColumns",
      boardDetails.boardColumns.map((bc) => ({
        name: bc.title,
        columnID: bc.id,
      }))
    );
  }, [boardDetails, type === "editBoard"]);

  useEffect(() => {
    if (!boardDetails) return;
    form.setValue("boardName", boardDetails.title);
  }, [boardDetails?.title]);

  if (error) {
    console.log(error);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!boardDetails) return;

    console.log(values);

    const filterOutEmptyInputs = values.boardColumns.filter((bc) => !!bc.name);

    const columnsWithId = values.boardColumns.filter((bc) => !!bc.columnID);

    const formattedColumns: { [key: string]: string } = {};
    boardDetails.boardColumns.forEach(
      (bc) => (formattedColumns[bc.id] = bc.title)
    );

    //? create
    const createColumns = filterOutEmptyInputs.filter((bc) => !bc.columnID);

    //* update
    const updateColumns = columnsWithId.filter(
      (c) => c.name && c.name !== formattedColumns[c.columnID as string]
    ) as { name: string; columnID: string }[];

    //! delete
    const columnsArrayWithOnlyId = columnsWithId.map(
      (c) => c.columnID as string
    );
    const deleteColumns = Object.entries(formattedColumns)
      .filter((c) => !columnsArrayWithOnlyId.includes(c[0]))
      .map((c) => c[0]);

    if (
      values.boardName === boardDetails.title &&
      createColumns.length === 0 &&
      deleteColumns.length === 0 &&
      updateColumns.length === 0
    )
      return onClose();

    editBoard({
      boardID: router.query.id as string,
      title:
        values.boardName === boardDetails.title ? undefined : values.boardName,
      deleteColumns,
      createColumns,
      updateColumns,
    });
  }

  return (
    <Dialog open={type === "editBoard"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit board</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : boardDetails ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="boardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board name</FormLabel>
                    <FormControl>
                      <Input
                        // defaultValue={boardDetails.title}
                        placeholder="e.g. Wandering Maniac"
                        // {...{ ...field, value: undefined }}
                        {...field}
                        className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <fieldset className="grid w-full gap-2.5">
                <Label>Board Columns</Label>
                <div ref={boardColumnsParent} className="space-y-2.5">
                  {fields.map((bc, idx) => (
                    <FormField
                      key={bc.id}
                      control={form.control}
                      name={`boardColumns.${idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-x-2">
                              <Input
                                // defaultValue={bc.name}
                                // {...{ ...field, value: undefined }}
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
                onClick={() => append({ name: "" })}
                type="button"
                size="full"
                className="w-full font-bold capitalize text-white dark:text-main-color"
              >
                + add new column
              </Button>

              <DialogFooter className="sm:flex-col sm:space-x-0">
                <Button
                  type="submit"
                  size="full"
                  variant="purple"
                  disabled={editingBoard}
                  className="w-full font-bold capitalize"
                >
                  {editingBoard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      saving
                    </>
                  ) : (
                    "save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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

// useEffect(() => {
//   const testFn = () => {
//     utils.board.getSingleBoard.setData(
//       {
//         boardID: router.query.id as string,
//       },
//       (old) => {
//         if (!old) return old;
//         return { ...old, title: "changed" };
//       }
//     );
//   };

//   const timer = setTimeout(testFn, 1000);
// }, []);
