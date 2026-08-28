"use client";

import {
  Gauge,
  History,
  LogOut,
  Mic,
  PartyPopper,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/admin/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";

const items = [
  { title: "Overview", href: "/admin", icon: Gauge },
  { title: "Rooms", href: "/admin/rooms", icon: Mic },
  { title: "Gifts", href: "/admin/gifts", icon: PartyPopper },
  { title: "Changelog", href: "/admin/changelog", icon: History },
  { title: "Members", href: "/admin/members", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = items.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href),
  );

  return (
    <SidebarProvider>
      <div className="relative flex min-h-svh w-full bg-background">
        {/* Background Honeycomb Hex Pattern SVG */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="admin-hexagons"
                width="56"
                height="100"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(1)"
              >
                <path
                  d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z M28 100L0 84L0 50L28 66L56 50L56 84L28 100Z"
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-hexagons)" />
          </svg>
        </div>

        {/* Radial Honey Glow Gradient */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16),transparent_65%)]" />

        <Sidebar collapsible="icon" className="z-10">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" render={<Link href="/admin" />}>
                  <Image
                    src="/logo/favicon-96x96.png"
                    alt="Beereel Logo"
                    width={36}
                    height={36}
                    quality={100}
                    className="size-9 rounded-xl"
                  />
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text font-semibold text-transparent">
                      Beereel
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Admin Console
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={active}
                          tooltip={item.title}
                          className="cursor-pointer"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" target="_blank" />}
                  tooltip="View site"
                  className="cursor-pointer"
                >
                  <Gauge className="size-4" />
                  <span>View site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <form action={logoutAction} className="w-full">
                  <SidebarMenuButton
                    render={<button type="submit" />}
                    tooltip="Sign out"
                    className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg md:px-6">
            <SidebarTrigger className="cursor-pointer" />
            <Separator orientation="vertical" className="mr-1 h-5" />
            <div className="flex min-w-0 flex-col">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Beereel Admin
              </span>
              <h1 className="truncate text-sm font-semibold">
                {current?.title ?? "Dashboard"}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden gap-1.5 rounded-full sm:inline-flex"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </Badge>
              <Avatar size="sm" className="ring-2 ring-border">
                <AvatarFallback className="bg-gradient-to-br from-[#fde68a] to-[#fbbf24] font-bold text-[#78350f]">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="relative z-10 flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
