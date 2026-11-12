import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { navigationItems } from "../../app/navigation";
import type { UserRole } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import { logout } from "../../features/auth/store/authSlice";

function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const currentRole: UserRole = user?.role ?? "STUDENT";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stale-50 text-slate-950">
      <aside className=" fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <SidebarContent currentRole={currentRole} />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden  bg-slate-950/40">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/40"
            onClick={closeMobileMenu}
          />
          <aside className="relative h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white px-3 py-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <BrandBlock />

              <button
                type="button"
                aria-label="Close menu"
                className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                onClick={closeMobileMenu}
              >
                {" "}
                <X size={18} />
              </button>
            </div>
            <NavigationList
              currentRole={currentRole}
              onNavigate={closeMobileMenu}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className=" sticky top-0 z-10 border-b border-slate-200 bg-white lg:px-6 py-4">
          <div className=" flex items-center justify-between gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate100 lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                {" "}
                <Menu size={18} />
              </button>
              <div className="m-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  {user?.email ?? "Signed in"}
                </p>
                <h2 className="truncate text-base font-semibold sm:text-lg">
                  {currentRole.replaceAll("_", " ")} Workspace
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg:slate-100 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type SidebarContentProps = {
  currentRole: UserRole;
};

function SidebarContent({ currentRole }: SidebarContentProps) {
  return (
    <>
      <BrandBlock />
      <NavigationList currentRole={currentRole} />
    </>
  );
}

function BrandBlock() {
  return (
    <div>
      <h1 className="mt-1 text-sm font-medium"> School Management System</h1>
    </div>
  );
}

type NavigationListProps = {
  currentRole: UserRole;
  onNavigate?: () => void;
};

function NavigationList({ currentRole, onNavigate }: NavigationListProps) {
  const visibileNavigationItems = navigationItems.filter((item) =>
    item.allowedRoles.includes(currentRole),
  );

  return (
    <nav className="mt-8 space-y-1">
      {visibileNavigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default AppLayout;
