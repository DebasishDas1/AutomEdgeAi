"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  ChartColumn,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import React from "react";

const data = {
  navMain: [
    { title: "Dashboard", url: "/omnichat/dashboard", icon: LayoutDashboard },
    { title: "Inbox", url: "/omnichat/inbox", icon: Inbox, badge: 12 },
    { title: "Pipeline", url: "/omnichat/pipeline", icon: ChartColumn },
  ],
  navTeam: [
    { title: "Team", url: "/omnichat/team", icon: Users },
    { title: "Analytics", url: "/omnichat/analytics", icon: BarChart3 },
    { title: "Settings", url: "/omnichat/settings", icon: Settings },
  ],
  user: {
    name: "James R.",
    role: "Broker-Owner",
  },
};

const RenderMenuItem = React.memo(
  ({
    item,
    active,
    collapsed,
  }: {
    item: any;
    active: boolean;
    collapsed: boolean;
  }) => {
    const Icon = item.icon;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={active}
          className="flex items-center gap-3"
        >
          <Link href={item.url}>
            <Icon className="size-4 shrink-0" />

            {!collapsed && <span>{item.title}</span>}

            {!collapsed && item.badge && (
              <span className="ml-auto rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  },
);

function RenderMenu({
  items,
  collapsed,
}: {
  items: any[];
  collapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = pathname.startsWith(item.url);

        return (
          <RenderMenuItem
            key={item.title}
            item={item}
            active={active}
            collapsed={collapsed}
          />
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            {/* Title */}
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <SidebarMenuButton size="lg" className="text-xl font-bold">
                    <Link href="/omnichat" className="flex items-center">
                      OmniChat
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trigger */}
            <div
              className={
                collapsed
                  ? "flex flex-1 justify-center pt-1"
                  : "flex items-center"
              }
            >
              <SidebarTrigger
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                  borderRadius: 6,
                }}
                className="hover:bg-accent"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Body */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <RenderMenu items={data.navMain} collapsed={collapsed} />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <RenderMenu items={data.navTeam} collapsed={collapsed} />
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-2 w-full">
              <Avatar className="size-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JR</AvatarFallback>
              </Avatar>

              {!collapsed && (
                <>
                  <div className="flex flex-col">
                    <span className="font-medium">{data.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {data.user.role}
                    </span>
                  </div>

                  <ChevronDown className="size-4 ml-auto" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          {!collapsed && (
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
