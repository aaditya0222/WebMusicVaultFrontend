"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { logout } from "@/services/auth.services";
import { clearAuth } from "@/reduxSlices/auth.slice";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  ListMusic,
  Shuffle,
  Info,
  CloudUpload,
  CircleUser,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import { toastList } from "@/utils/toastList";
import { useEffect, useState } from "react";
import Image from "next/image";

const navItems = [
  { name: "Music", to: "/", icon: Home },
  { name: "Search", to: "/search", icon: Search },
  { name: "Playlist", to: "/playlist", icon: ListMusic },
  { name: "Shuffle", to: "/shuffle", icon: Shuffle },
  { name: "Upload", to: "/upload", icon: CloudUpload },
  { name: "About", to: "/about", icon: Info },
  { name: "Profile", to: "/me", icon: CircleUser },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toastList.loggedOut();
    } catch {
      toastList.genericError(
        "Logout failed on the server, but you're signed out here.",
      );
    } finally {
      dispatch(clearAuth());
      router.replace("/login");
    }
  };

  const initials = user?.displayName
    ? user.displayName.includes(" ")
      ? user.displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : user.displayName[0]?.toUpperCase()
    : user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full bg-[#1a0635] border-r border-purple-500/10">
      <div className="p-5 border-b border-purple-500/10">
        <Link
          href="/"
          aria-label="WebMusicVault Home"
          className="flex items-center gap-2.5 select-none group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-500/30 group-hover:border-purple-500/60 transition-all duration-300">
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </div>
          <span className="font-semibold text-2xl tracking-tight text-zinc-300 group-hover:text-white transition-colors duration-300">
            WebMusicVault
          </span>
        </Link>
      </div>

      <div className="px-4 py-4 border-b border-purple-500/10">
        {user ? (
          <Link
            href="/me"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.displayName || user.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                {user.displayName || user.username}
              </p>
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <CircleUser className="w-5 h-5 text-white/40" />
            </div>
            <span className="text-white/40 text-sm">Not signed in</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ name, to, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              href={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white bg-purple-600/30 border border-purple-400/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-white" : "text-zinc-400"}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-500/10">
        {accessToken ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/20 transition-colors group"
          >
            <LogOut className="w-4 h-4 text-red-400/60 group-hover:text-red-400 transition-colors" />
            Logout
          </button>
        ) : (
          <div className="space-y-1">
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-purple-500/10 transition-colors group"
            >
              <LogIn className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
              Login
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-purple-500/10 transition-colors group"
            >
              <UserPlus className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
