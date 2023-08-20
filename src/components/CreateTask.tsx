import { X } from "lucide-react";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Textarea } from "./ui/textarea";

export default function CreateTask() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="full"
          variant="purple"
          className="h-12 px-5 text-base font-semibold capitalize"
        >
          + add new task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-main-background sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new task</DialogTitle>
        </DialogHeader>

        <fieldset className="mt-2 grid w-full gap-2.5">
          <Label htmlFor="name">Task Name</Label>
          <Input
            id="name"
            placeholder="e.g. Take coffee break"
            className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </fieldset>

        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            placeholder="e.g. It's always good to take a break. This  15 minute break will  recharge the batteries  a little."
            id="description"
            className="h-28 cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </fieldset>

        <fieldset className="grid w-full gap-2.5">
          <Label>Subtasks</Label>
          <div className="flex items-center gap-x-2">
            <Input className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
            <X className="h-7 w-7 cursor-pointer text-gray-400" />
          </div>
          <div className="flex items-center gap-x-2">
            <Input className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
            <X className="h-7 w-7 cursor-pointer text-gray-400" />
          </div>
        </fieldset>

        <Button
          type="button"
          size="full"
          className="w-full font-bold capitalize text-white dark:text-main-color"
        >
          + add new subtask
        </Button>

        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="status">Current Status</Label>
          <Select defaultValue="todo">
            <SelectTrigger
              id="status"
              className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0"
            >
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="doing">Doing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </fieldset>

        <DialogFooter className="sm:flex-col sm:space-x-0">
          <Button
            type="submit"
            size="full"
            variant="purple"
            className="w-full font-bold capitalize"
          >
            create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
