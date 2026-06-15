import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    courses: 0,
    professors: 0,
    students: 0,
    newStudents: 0,
    messages: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    Promise.all([
      api.getCourses(true),
      api.getProfessors(true),
      api.getStudents(),
      api.getMessages(),
    ]).then(([courses, professors, students, messages]) => {
      setStats({
        courses: courses.length,
        professors: professors.length,
        students: students.length,
        newStudents: students.filter((s) => s.status === "new").length,
        messages: messages.length,
        unreadMessages: messages.filter((m) => !m.is_read).length,
      });
    });
  }, []);

  const cards = [
    { label: "კურსები", value: stats.courses, to: "/admin/courses" },
    { label: "ლექტორები", value: stats.professors, to: "/admin/professors" },
    {
      label: "განაცხადები",
      value: stats.students,
      hint: `${stats.newStudents} ახალი`,
      to: "/admin/students",
    },
    {
      label: "შეტყობინებები",
      value: stats.messages,
      hint: `${stats.unreadMessages} წაუკითხავი`,
      to: "/admin/messages",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">მთავარი პანელი</h1>
      <p className="mt-1 text-slate-500">საიტის მიმოხილვა.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-6 transition hover:shadow-md">
            <div className="text-sm font-medium text-slate-500">{c.label}</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{c.value}</div>
            {c.hint && <div className="mt-1 text-xs font-medium text-brand-600">{c.hint}</div>}
          </Link>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-semibold text-slate-900">სწრაფი მოქმედებები</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/courses" className="btn-outline">კურსების მართვა</Link>
          <Link to="/admin/professors" className="btn-outline">ლექტორების მართვა</Link>
          <Link to="/admin/content" className="btn-outline">კონტენტის რედაქტირება</Link>
          <Link to="/admin/students" className="btn-outline">განაცხადების განხილვა</Link>
        </div>
      </div>
    </div>
  );
}
