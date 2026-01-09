import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type Role = "superadmin" | "tenant_admin" | "staff" | "client";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard" }: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = "/";
        return;
      }
      
      if (user && !allowedRoles.includes(user.role as Role)) {
        // Redirect if user doesn't have required role
        setLocation(redirectTo);
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectTo, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}

// Helper function to check if user has admin role
export function isAdmin(role?: string): boolean {
  return role === "superadmin" || role === "tenant_admin";
}

// Helper function to check if user has staff or higher role
export function isStaffOrHigher(role?: string): boolean {
  return role === "superadmin" || role === "tenant_admin" || role === "staff";
}

// Helper function to check if user is a client
export function isClient(role?: string): boolean {
  return role === "client";
}
