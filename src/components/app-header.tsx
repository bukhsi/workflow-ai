import { Bell, Moon, Search, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";

export function AppHeader() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:gap-4 sm:px-5">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools, history, settings…"
          className="h-9 rounded-xl border-border/70 bg-muted/50 pl-9"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-xl">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-xl"
          onClick={toggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Profile" className="rounded-xl">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}