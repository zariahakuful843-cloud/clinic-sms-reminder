"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FiHome },
  { href: "/patients", label: "Patients", icon: FiUsers },
  { href: "/appointments", label: "Appointments", icon: FiCalendar },
  { href: "/sms", label: "SMS Logs", icon: FiMessageSquare },
  { href: "/reports", label: "Reports", icon: FiBarChart2 },
];

function NavContent({
  pathname,
  onLinkClick,
  onLogout,
}: {
  pathname: string;
  onLinkClick: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Clinic SMS</h1>
        <p className="text-sm text-blue-200 mt-1">Reminder System</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700/50"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700/50 w-full transition-colors"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-800 text-white rounded-lg"
      >
        <FiMenu size={24} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-800 flex flex-col transform transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white"
        >
          <FiX size={24} />
        </button>
        <NavContent
          pathname={pathname}
          onLinkClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
