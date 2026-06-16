import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/LandingPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LecturersPage from "./pages/LecturersPage";
import LecturerDetailPage from "./pages/LecturerDetailPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import CoursesAdmin from "./pages/admin/CoursesAdmin";
import ProfessorsAdmin from "./pages/admin/ProfessorsAdmin";
import StudentsAdmin from "./pages/admin/StudentsAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import ContentAdmin from "./pages/admin/ContentAdmin";
import EmailAdmin from "./pages/admin/EmailAdmin";
import DocsPage from "./pages/admin/DocsPage";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/lecturers" element={<LecturersPage />} />
        <Route path="/lecturers/:id" element={<LecturerDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="courses" element={<CoursesAdmin />} />
        <Route path="professors" element={<ProfessorsAdmin />} />
        <Route path="students" element={<StudentsAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="email" element={<EmailAdmin />} />
        <Route path="docs" element={<DocsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
