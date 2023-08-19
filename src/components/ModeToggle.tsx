import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Switch } from "./ui/switch";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  if (!mounted) return null;

  return (
    <div className="mx-4 mt-auto flex items-center justify-center gap-x-5 rounded-md bg-board-background py-3">
      <Sun className="h-[1.2rem] w-[1.2rem] text-[#838FA2]" />
      <Switch
        id="mode-toggle"
        checked={theme === "dark" ? true : false}
        onCheckedChange={() => setTheme(theme === "light" ? "dark" : "light")}
      />
      <Moon className="h-[1.2rem] w-[1.2rem] text-[#838FA2]" />
    </div>
  );
}
