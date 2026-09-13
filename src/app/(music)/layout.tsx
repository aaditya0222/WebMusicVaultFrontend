"use client";
import Navbar from "@/components/Navbar/Navbar";
import DesktopSidebar from "@/components/Navbar/DesktopSidebar";
import SongPlayerCombined from "@/components/SongPlayerPanel/SongPlayerCombined";
import DownloadProgress from "@/components/Download/DownloadProgress";
import { useAppSelector } from "@/store/hook";
import EditSongModal from "@/components/Modal/EditSongModal";
import CreatePlaylistModal from "@/components/Modal/CreatePlaylistModal";
import AddToPlaylistModal from "@/components/Modal/AddToPlaylistModal";
import EditPlaylistModal from "@/components/Modal/EditPlaylistModal";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = useAppSelector((state) => state.auth.user?.role) === "admin";
  return (
    <div className="bg-[#5520A5] flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Mobile navbar (top bar hidden on lg, bottom bar always visible) */}
      <Navbar />

      {/* Desktop sidebar rail — hidden below lg */}
      <DesktopSidebar />

      {/* Single content mount — flex-1 so it fills remaining width */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden text-white p-2 lg:p-4">
        {children}
      </main>

      {isAdmin && <EditSongModal />}
      <CreatePlaylistModal />
      <EditPlaylistModal />
      <AddToPlaylistModal />
      <SongPlayerCombined />
      <DownloadProgress />
    </div>
  );
}
