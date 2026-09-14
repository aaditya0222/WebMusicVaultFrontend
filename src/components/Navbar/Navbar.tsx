"use client";
import { useState, useRef, useLayoutEffect } from "react";
import { NavItem } from "./NavItem";
import { setNavHeight } from "@/reduxSlices/ui.slice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { logout } from "@/services/auth.services";
import { clearAuth } from "@/reduxSlices/auth.slice";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Search,
  ListMusic,
  Shuffle,
  MoreHorizontal,
  Info,
  CircleUser,
  CloudUpload,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import AppLogo from "./AppLogo";
import Link from "next/link";
import { toastList } from "@/utils/toastList";

const bottomNavItems = [
  { name: "Music", to: "/", icon: Home },
  { name: "Playlist", to: "/playlist", icon: ListMusic },
  { name: "About", to: "/about", icon: Info },
  { name: "Shuffle", to: "/shuffle", icon: Shuffle },
];

const moreRoutes = [
  { name: "Upload", to: "/upload", icon: CloudUpload },
  { name: "Profile", to: "/me", icon: CircleUser },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const isSearchActive = pathname === "/search";

  const desktopRoutes = [
    { name: "Music", to: "/" },
    { name: "Playlist", to: "/playlist" },
    { name: "Shuffle", to: "/shuffle" },
    { name: "Upload", to: "/upload" },
    { name: "Profile", to: "/me" },
    { name: "About", to: "/about" },
  ];

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
      setMoreOpen(false);
      router.replace("/login");
    }
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const updateHeight = () => {
      if (navRef.current) dispatch(setNavHeight(navRef.current.offsetHeight));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [dispatch]);

  return (
    <>
      {/* ── Top navbar — mobile only (hidden on lg where sidebar takes over) ── */}
      <nav
        className="lg:hidden bg-[#1a0635] border-b border-purple-500/10 sticky top-0 z-50 rounded-b-xl"
        ref={navRef}
      >
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <AppLogo />

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center space-x-2">
            <li>
              <Link
                href="/search"
                aria-label="Search"
                className={
                  isSearchActive
                    ? "flex items-center justify-center p-1 rounded-lg text-white bg-purple-600/40 border border-purple-400/30 transition-all"
                    : "flex items-center justify-center p-1 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
                }
              >
                <Search className="w-6   h-6" />
              </Link>
            </li>
            {desktopRoutes.map((link) => (
              <li key={link.to}>
                <NavItem href={link.to} label={link.name} variant="desktop" />
              </li>
            ))}
            {accessToken ? (
              <li className="pl-2 border-l border-white/10">
                <button
                  onClick={handleLogout}
                  aria-label="Log out of your account"
                  className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <NavItem href="/login" label="Login" variant="desktop" />
                </li>
                <li>
                  <NavItem href="/signup" label="Register" variant="desktop" />
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <>
        {moreOpen && (
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => setMoreOpen(false)}
          >
            <div
              className="absolute bottom-16 left-0 right-0 mx-4 bg-[#1a0635] border border-purple-500/20 rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {moreRoutes.map(({ name, to, icon: Icon }) => (
                <Link
                  key={to}
                  href={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-300 hover:bg-purple-500/10 border-b border-purple-500/10 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
                  {name}
                </Link>
              ))}
              {accessToken ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-5 py-4 text-sm text-red-400 hover:bg-red-950/20 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-red-400/60 group-hover:text-red-400 transition-colors" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-300 hover:bg-purple-500/10 border-b border-purple-500/10 transition-colors group"
                  >
                    <LogIn className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-300 hover:bg-purple-500/10 border-b border-purple-500/10 transition-colors group"
                  >
                    <UserPlus className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a0635] border-t border-purple-500/20">
          <div className="flex items-center justify-around px-2 py-2">
            {bottomNavItems.map(({ name, to, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  href={to}
                  className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
                >
                  <Icon
                    size={22}
                    className={`transition-colors ${isActive ? "text-white" : "text-white/40"}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${isActive ? "text-white" : "text-white/40"}`}
                  >
                    {name}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => setMoreOpen(!moreOpen)}
              aria-label={moreOpen ? "Close menu" : "Open more options"}
              aria-expanded={moreOpen}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
            >
              <MoreHorizontal
                size={22}
                className={`transition-colors ${moreOpen ? "text-white" : "text-white/40"}`}
                strokeWidth={moreOpen ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${moreOpen ? "text-white" : "text-white/40"}`}
              >
                More
              </span>
              {moreOpen && (
                <span className="w-1 h-1 rounded-full bg-orange-400" />
              )}
            </button>
          </div>
        </div>
      </>
    </>
  );
};

export default Navbar;
