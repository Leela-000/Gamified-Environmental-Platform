import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

type Role = "admin" | "student" | "teacher";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true, 
  redirectTo = "/signin" 
}: ProtectedRouteProps) {
  const { role } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If authentication is required but user is not logged in
    if (requireAuth && !role) {
      setLocation(redirectTo);
      return;
    }

    // If specific roles are required but user doesn't have the right role
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // Redirect based on user's actual role
      if (role === 'student') {
        setLocation('/student');
      } else if (role === 'teacher') {
        setLocation('/teacher');
      } else if (role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
      return;
    }
  }, [role, allowedRoles, requireAuth, redirectTo, setLocation]);

  // Don't render if user doesn't meet requirements
  if (requireAuth && !role) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific role protection
export function StudentOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {children}
    </ProtectedRoute>
  );
}

export function TeacherOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentOrTeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student", "teacher"]}>
      {children}
    </ProtectedRoute>
  );
}