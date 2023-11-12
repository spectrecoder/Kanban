import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import Sidebar from "./Sidebar";
import { ScrollArea } from "./ui/scroll-area";

export default function SidebarSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="mr-2 block h-7 w-7 cursor-pointer lg:hidden" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <ScrollArea className="flex h-full border-0 border-r border-solid border-main-border bg-main-background">
          <Sidebar />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
