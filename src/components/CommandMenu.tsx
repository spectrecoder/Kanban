import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { DialogProps } from "@radix-ui/react-alert-dialog";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useRouter } from "next/router";
import { api } from "~/lib/api";
import { Loader2 } from "lucide-react";

export default function CommandMenu({ ...props }: DialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: allBoards, isLoading } = api.board.getBoards.useQuery();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start bg-board-background text-sm text-muted-foreground hover:bg-board-background/60 sm:pr-12 md:w-40 lg:w-64"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search board...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-7 select-none items-center gap-1 rounded border bg-main-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {/* <CommandEmpty>No results found.</CommandEmpty> */}
          {isLoading ? (
            <Loader2 className="mx-auto my-3 h-6 w-6 animate-spin" />
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {allBoards ? (
            <CommandGroup heading="Boards">
              {allBoards.map((b) => (
                <CommandItem
                  key={b.id}
                  value={b.title}
                  onSelect={() => {
                    runCommand(() => router.push(`/board/${b.id}`));
                  }}
                >
                  {b.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
