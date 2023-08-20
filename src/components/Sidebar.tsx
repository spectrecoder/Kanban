import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import { EyeOff, PanelRight } from "lucide-react";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import CreateBoard from "./CreateBoard";
import ModeToggle from "./ModeToggle";

const ACTIVE = true;

export default function Sidebar() {
  const hideSidebar = useSidebar((state) => state.onClose);

  return (
    <ScrollArea className="flex h-full w-64 border-0 border-r border-solid border-main-border bg-main-background">
      <aside className="flex min-h-screen w-full flex-col">
        <figure className="mt-5 flex w-full items-center gap-x-3 pl-6">
          <Image
            width={24}
            height={25}
            src="/images/logo-kanban.svg"
            alt="logo"
            className="object-cover"
          />
          <figcaption className="text-3xl font-bold text-primary">
            kanban
          </figcaption>
        </figure>

        <h3 className="mb-4 mt-10 pl-6 text-xs font-bold uppercase tracking-widest text-gray-400">
          all boards (3)
        </h3>

        <Link
          href="/"
          className={`mr-6 flex items-center gap-x-4 rounded-r-full py-3 pl-5 ${
            ACTIVE
              ? "bg-main-color text-white"
              : "text-gray-400 transition-all duration-300 hover:bg-board-background hover:text-main-color"
          }`}
        >
          <PanelRight className="h-[1.2rem] w-[1.2rem]" />
          <p className="text-base font-semibold">Platform Launch</p>
        </Link>

        <CreateBoard />

        <ModeToggle />
        <button
          onClick={hideSidebar}
          className={`mb-2 mt-3 flex items-center gap-x-4 rounded-r-full py-3 pl-5 text-gray-400 transition-all duration-300 hover:bg-board-background hover:text-main-color`}
        >
          <EyeOff className="h-[1.2rem] w-[1.2rem]" />
          <p className="text-base font-semibold capitalize">hide sidebar</p>
        </button>
      </aside>
    </ScrollArea>
  );
}
