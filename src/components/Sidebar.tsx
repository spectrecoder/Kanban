import { useAutoAnimate } from "@formkit/auto-animate/react";
import { EyeOff, Loader2, PanelRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/lib/api";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import { useModal } from "~/lib/hooks/useModal";
import ModeToggle from "./ModeToggle";
import { ScrollArea } from "./ui/scroll-area";
import { QuotaBar } from "./QuotaBar";

const ACTIVE = true;

export default function Sidebar() {
  const hideSidebar = useSidebar((state) => state.onClose);
  const openCreateBoard = useModal((state) => state.onOpen);
  const router = useRouter();
  const [sideBarParent] = useAutoAnimate();

  const { data: allBoards, isLoading } = api.board.getBoards.useQuery();

  return (
    // <ScrollArea className="flex w-64 h-full border-0 border-r border-solid border-main-border bg-main-background">
    <aside className="flex min-h-screen w-full flex-col">
      <Link
        href="/"
        className="mb-10 mt-5 flex w-full items-center gap-x-3 pl-6"
      >
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
      </Link>

      {isLoading ? (
        <Loader2 className="mx-auto mb-5 h-6 w-6 animate-spin" />
      ) : allBoards ? (
        <>
          <h3 className="mb-2 pl-6 text-xs font-bold uppercase tracking-widest text-gray-400">
            all boards ({allBoards.length})
          </h3>

          <div ref={sideBarParent}>
            {allBoards.map((b) => (
              <Link
                key={b.id}
                href={`/board/${b.id}`}
                className={`mr-6 flex items-center gap-x-4 rounded-r-full py-3 pl-5 ${
                  router.asPath.includes(b.id)
                    ? "bg-main-color text-white"
                    : "text-gray-400 transition-all duration-300 hover:bg-board-background hover:text-main-color"
                }`}
              >
                <PanelRight className="h-[1.2rem] w-[1.2rem]" />
                <p className="text-base font-semibold">{b.title}</p>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <button
        onClick={() => openCreateBoard("createBoard")}
        className={`mb-auto mr-6 flex items-center gap-x-4 rounded-r-full py-3 pl-5 text-main-color transition-all duration-300 hover:bg-board-background hover:text-main-color`}
      >
        <PanelRight className="h-[1.2rem] w-[1.2rem]" />
        <p className="text-base font-semibold capitalize">+create new board</p>
      </button>

      <QuotaBar />
      <ModeToggle />
      <button
        onClick={hideSidebar}
        className={`mb-2 hidden items-center gap-x-4 rounded-r-full py-3 pl-5 text-gray-400 transition-all duration-300 hover:bg-board-background hover:text-main-color lg:flex`}
      >
        <EyeOff className="h-[1.2rem] w-[1.2rem]" />
        <p className="text-base font-semibold capitalize">hide sidebar</p>
      </button>
    </aside>
    // </ScrollArea>
  );
}
