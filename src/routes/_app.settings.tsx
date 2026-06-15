import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useTheme } from "@/hooks/use-theme";
import { clearEvents } from "@/lib/usage";
import { toast } from "sonner";
import { Moon, Sun, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workspace AI" },
      { name: "description", content: "Appearance and data preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Manage appearance and local usage data." />

      <Card className="flex flex-col gap-3 p-6">
        <h3 className="text-sm font-semibold">Appearance</h3>
        <p className="text-xs text-muted-foreground">Choose how Workspace AI looks on this device.</p>
        <div className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" /> Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" /> Dark
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h3 className="text-sm font-semibold">Usage data</h3>
        <p className="text-xs text-muted-foreground">
          Productivity stats are stored locally in your browser. Sign-in and cloud sync are coming soon.
        </p>
        <div>
          <Button
            variant="destructive"
            onClick={() => {
              clearEvents();
              toast.success("Usage history cleared");
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear all usage history
          </Button>
        </div>
      </Card>
    </div>
  );
}