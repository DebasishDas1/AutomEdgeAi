import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1 w-full">
        <div className="flex items-center gap-2 md:hidden">
          {/* Glass trigger */}
          <div className="backdrop-blur-md bg-white/10 border border-white/30 shadow-md rounded-full ml-2 mt-2">
            <SidebarTrigger />
          </div>

          {/* Glass title */}
          <span className="backdrop-blur-md bg-white/10 border border-white/30 shadow-md rounded-xl px-3 py-1 text-lg font-semibold text-white drop-shadow-sm mt-2">
            OmniChat
          </span>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
