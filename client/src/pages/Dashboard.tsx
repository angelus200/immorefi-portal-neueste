import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  Users, 
  FileText, 
  Settings,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  ClipboardList,
  BarChart3,
  Shield,
  ChevronRight,
  ShoppingCart,
  FileCheck,
  ClipboardCheck,
  Calculator,
  BookOpen
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from '@/components/DashboardLayoutSkeleton';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import { trpc } from "@/lib/trpc";

// Tenant ID - in production this would come from context/subdomain
const TENANT_ID = 1;

const clientMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calculator, label: "Finanzrechner", path: "/tools/interest-calculator" },
  { icon: BookOpen, label: "Glossar", path: "/tools/glossary" },
  { icon: ShoppingCart, label: "Bestellungen", path: "/orders" },
  { icon: FileCheck, label: "Verträge", path: "/contracts" },
  { icon: FolderOpen, label: "Dokumente", path: "/documents" },
  { icon: ClipboardList, label: "Aufgaben", path: "/tasks" },
];

const staffMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Leads", path: "/crm/leads" },
  { icon: TrendingUp, label: "Deals", path: "/crm/deals" },
  { icon: Building2, label: "Kontakte", path: "/crm/contacts" },
  { icon: FileText, label: "Dokumente", path: "/documents" },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Leads", path: "/crm/leads" },
  { icon: TrendingUp, label: "Deals", path: "/crm/deals" },
  { icon: Building2, label: "Kontakte", path: "/crm/contacts" },
  { icon: FileText, label: "Dokumente", path: "/documents" },
  { icon: FileCheck, label: "Verträge", path: "/admin/contracts" },
  { icon: ShoppingCart, label: "Bestellungen", path: "/admin/orders" },
  { icon: ClipboardCheck, label: "Onboarding-Daten", path: "/admin/onboarding" },
  { icon: BarChart3, label: "Benutzer", path: "/admin/users" },
  { icon: Shield, label: "Audit Log", path: "/admin/audit" },
  { icon: Settings, label: "Einstellungen", path: "/admin/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

function DashboardContent() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'superadmin' || user?.role === 'tenant_admin';
  const isStaff = user?.role === 'staff' || isAdmin;

  const { data: tasks } = trpc.task.list.useQuery({ tenantId: TENANT_ID });
  const { data: deals } = trpc.deal.list.useQuery({ tenantId: TENANT_ID }, { enabled: isAdmin });
  const { data: leads } = trpc.lead.list.useQuery({ tenantId: TENANT_ID }, { enabled: isAdmin });
  const { data: onboardingStatus } = trpc.onboarding.getMyStatus.useQuery();

  const pendingTasks = tasks?.filter(t => t.status === 'todo' || t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(t => t.status === 'done') || [];
  const taskProgress = tasks?.length ? (completedTasks.length / tasks.length) * 100 : 0;

  // Calculate onboarding progress for clients
  const onboardingProgress = onboardingStatus?.onboardingProgress || {};
  const onboardingSteps = [
    onboardingProgress.profileCompleted,
    onboardingProgress.firstBooking,
    onboardingProgress.firstDocument,
    onboardingProgress.firstOrder,
  ];
  const completedOnboardingSteps = onboardingSteps.filter(Boolean).length;
  const totalOnboardingSteps = 5; // Account created (always true) + 4 steps
  const onboardingProgressPercent = ((completedOnboardingSteps + 1) / totalOnboardingSteps) * 100;

  const newLeads = leads?.filter(l => l.status === 'new') || [];
  const qualifiedLeads = leads?.filter(l => l.status === 'qualified') || [];

  // Check if this is the user's first login (account created recently)
  const welcomeText = `Willkommen, ${user?.name?.split(' ')[0] || 'Benutzer'}!`;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {welcomeText}
        </h1>
        <p className="text-muted-foreground mt-1">
          Hier ist eine Übersicht Ihrer aktuellen Aktivitäten.
        </p>
      </div>

      {/* Onboarding Checklist - only for non-admin users */}
      {!isAdmin && <OnboardingChecklist />}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isStaff && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Neue Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newLeads.length}</div>
                <p className="text-xs text-muted-foreground">
                  {qualifiedLeads.length} qualifiziert
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Deals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deals?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In der Pipeline
                </p>
              </CardContent>
            </Card>
          </>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} erledigt
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Aufgaben-Fortschritt' : 'Onboarding-Fortschritt'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(isAdmin ? taskProgress : onboardingProgressPercent)}%
            </div>
            <Progress value={isAdmin ? taskProgress : onboardingProgressPercent} className="mt-2" />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground mt-2">
                {completedOnboardingSteps + 1} von {totalOnboardingSteps} Schritte
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Aufgaben</CardTitle>
            <CardDescription>Ihre nächsten To-Dos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${
                    task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.dueAt && (
                      <p className="text-xs text-muted-foreground">
                        Fällig: {new Date(task.dueAt).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                  {task.status === 'in_progress' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      In Bearbeitung
                    </span>
                  )}
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine offenen Aufgaben
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>Häufig verwendete Aktionen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {isStaff && (
                <>
                  <Link href="/crm/leads">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Leads verwalten
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/crm/deals">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Deal Pipeline
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/documents">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Dokumente
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin/audit">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Audit Log
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity for Staff/Admin */}
      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Neueste Leads</CardTitle>
            <CardDescription>Die letzten Anfragen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads?.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      lead.status === 'new' ? 'bg-blue-500' :
                      lead.status === 'contacted' ? 'bg-yellow-500' :
                      lead.status === 'qualified' ? 'bg-green-500' :
                      lead.status === 'converted' ? 'bg-emerald-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {lead.kapitalbedarf || 'Keine Angabe'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status === 'new' ? 'Neu' :
                     lead.status === 'contacted' ? 'Kontaktiert' :
                     lead.status === 'qualified' ? 'Qualifiziert' :
                     lead.status === 'converted' ? 'Konvertiert' :
                     'Verloren'}
                  </span>
                </div>
              ))}
              {(!leads || leads.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Leads vorhanden
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Redirect to onboarding if not completed (only for clients)
  useEffect(() => {
    if (!loading && user && user.role === 'client' && !user.onboardingCompleted) {
      setLocation('/onboarding');
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
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
              Bitte melden Sie sich an, um auf das Dashboard zuzugreifen.
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

  // Determine menu items based on role
  const menuItems = user.role === 'superadmin' || user.role === 'tenant_admin' 
    ? adminMenuItems 
    : user.role === 'staff' 
      ? staffMenuItems 
      : clientMenuItems;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": `${sidebarWidth}px`,
      } as CSSProperties}
    >
      <DashboardLayoutContent 
        setSidebarWidth={setSidebarWidth} 
        menuItems={menuItems}
      >
        <DashboardContent />
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  menuItems: typeof adminMenuItems;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  menuItems,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => location.startsWith(item.path));
  const isMobile = useIsMobile();

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
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-primary">NON</span>
                  <span className="font-bold text-primary bg-primary/10 px-1 rounded text-sm">DOM</span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path || 
                  (item.path !== '/dashboard' && location.startsWith(item.path));
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
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Rolle: {user?.role === 'superadmin' ? 'Super Admin' : 
                          user?.role === 'tenant_admin' ? 'Admin' :
                          user?.role === 'staff' ? 'Mitarbeiter' : 'Kunde'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <span className="tracking-tight text-foreground">
                  {activeMenuItem?.label ?? "Menu"}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
