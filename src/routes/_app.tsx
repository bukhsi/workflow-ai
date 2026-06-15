import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Toaster richColors position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}