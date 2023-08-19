import { PanelRight } from "lucide-react";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";

export function CreateBoard() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`mr-6 flex items-center gap-x-4 rounded-r-full py-3 pl-5 text-main-color transition-all duration-300 hover:bg-board-background hover:text-main-color`}
        >
          <PanelRight className="h-[1.2rem] w-[1.2rem]" />
          <p className="text-base font-semibold capitalize">
            +create new board
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-main-background sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new board</DialogTitle>
        </DialogHeader>
        <div className="">
          <Label htmlFor="name" className="text-right">
            Board Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Web Design"
            className="col-span-3 mt-1 cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
