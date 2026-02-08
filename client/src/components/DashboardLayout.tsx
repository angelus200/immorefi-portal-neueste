import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
  ShoppingCart,
  FileCheck,
  FolderOpen,
  ClipboardList,
  Settings,
  Shield,
  ClipboardCheck,
  FileText,
  BarChart3,
  Calculator,
  BookOpen,
  MessageCircle,
  Mail,
  UserPlus,
  Contact,
  Kanban,
  Calendar as CalendarIcon,
  Video,
  TrendingUp
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

// Client menu items - Simple and clean
const clientMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CalendarIcon, label: "Termin buchen", path: "/booking" },
  { icon: BookOpen, label: "📖 Glossar", path: "/tools/glossary" }, // Made more prominent with emoji
  { icon: ShoppingCart, label: "Bestellungen", path: "/orders" },
  { icon: FileText, label: "Rechnungen", path: "/invoices" },
  { icon: FolderOpen, label: "Dokumente", path: "/documents" },
  { icon: MessageCircle, label: "Nachrichten", path: "/admin/messages" },
  { icon: TrendingUp, label: "Affiliate Programm", path: "/dashboard/affiliate" },
  { icon: Settings, label: "Einstellungen", path: "/settings" },
];

// Admin menu items - Organized by sections
type MenuSection = {
  title: string;
  items: Array<{ icon: any; label: string; path: string }>;
};

const adminMenuSections: MenuSection[] = [
  {
    title: "Dashboard",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    title: "CRM",
    items: [
      { icon: UserPlus, label: "Leads", path: "/crm/leads" },
      { icon: Kanban, label: "Pipeline", path: "/crm/deals" },
      { icon: Contact, label: "Kontakte", path: "/crm/contacts" },
    ],
  },
  {
    title: "Termine",
    items: [
      { icon: CalendarIcon, label: "Mein Kalender", path: "/admin/my-calendar" },
      { icon: ClipboardList, label: "Buchungen", path: "/admin/bookings" },
    ],
  },
  {
    title: "Verwaltung",
    items: [
      { icon: ClipboardCheck, label: "Onboarding-Daten", path: "/admin/onboarding" },
      { icon: ShoppingCart, label: "Bestellungen", path: "/admin/orders" },
      { icon: FileText, label: "Rechnungen", path: "/admin/invoices" },
      { icon: FolderOpen, label: "Dokumente", path: "/documents" },
      { icon: FileCheck, label: "Verträge", path: "/admin/contracts" },
      { icon: MessageCircle, label: "Nachrichten", path: "/admin/messages" },
      { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
      { icon: Users, label: "Affiliates", path: "/admin/affiliates" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Users, label: "Benutzer", path: "/admin/users" },
      { icon: BarChart3, label: "Audit-Log", path: "/admin/audit" },
      { icon: FileText, label: "Vertragsvorlagen", path: "/admin/contract-templates" },
      { icon: FileText, label: "Logos", path: "/admin/logos" },
      { icon: Video, label: "Videos", path: "/admin/videos" },
      { icon: Settings, label: "Einstellungen", path: "/admin/settings" },
      { icon: BookOpen, label: "Handbuch", path: "/admin/handbuch" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Anmeldung erforderlich
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Für den Zugriff auf diesen Bereich ist eine Anmeldung erforderlich.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/sign-in";
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Anmelden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Check if user is admin
  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin" || user?.role === "staff";

  // Get active menu item label for header
  const getActiveMenuLabel = () => {
    // Check client menu
    const clientItem = clientMenuItems.find(item => item.path === location);
    if (clientItem) return clientItem.label;

    // Check admin sections
    if (isAdmin) {
      for (const section of adminMenuSections) {
        const adminItem = section.items.find(item => item.path === location);
        if (adminItem) return adminItem.label;
      }
    }

    return "Dashboard";
  };

  const activeMenuLabel = getActiveMenuLabel();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Navigation umschalten"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight whitespace-nowrap text-primary">
                    NON DOM GROUP
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {!isAdmin ? (
              // Client Menu - Simple and clean
              <SidebarMenu className="px-2 py-1">
                {clientMenuItems.map(item => {
                  const isActive = location === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setLocation(item.path)}
                        tooltip={item.label}
                        className="h-10 transition-all font-normal"
                      >
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                        />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            ) : (
              // Admin Menu - Organized by sections
              <>
                {adminMenuSections.map((section, sectionIndex) => (
                  <div key={section.title}>
                    {/* Section Header */}
                    {sectionIndex > 0 && (
                      <div className="px-4 py-3 mt-2">
                        {!isCollapsed ? (
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {section.title}
                          </div>
                        ) : (
                          <Separator className="my-1" />
                        )}
                      </div>
                    )}

                    {/* Section Items */}
                    <SidebarMenu className="px-2 py-1">
                      {section.items.map(item => {
                        const isActive = location === item.path;
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => setLocation(item.path)}
                              tooltip={item.label}
                              className="h-10 transition-all font-normal"
                            >
                              <item.icon
                                className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                              />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </div>
                ))}
              </>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="h-14 data-[state=open]:bg-accent"
                      tooltip={user?.name || user?.email || "Benutzer"}
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {(user?.name || user?.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-left min-w-0">
                        <span className="text-sm font-medium truncate max-w-full">
                          {user?.name || "Benutzer"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-full">
                          {user?.email || ""}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="start"
                    side="top"
                    sideOffset={8}
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || "Benutzer"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {isAdmin && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {user?.role === "superadmin" ? "Super Admin" : 
                           user?.role === "tenant_admin" ? "Admin" : "Mitarbeiter"}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setLocation("/settings")}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Einstellungen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        setLocation("/");
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          {/* Resize handle */}
          {!isCollapsed && !isMobile && (
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors"
              onMouseDown={() => setIsResizing(true)}
            />
          )}
        </Sidebar>
      </div>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 lg:hidden" />
            <h1 className="text-lg font-semibold">
              {activeMenuLabel}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
