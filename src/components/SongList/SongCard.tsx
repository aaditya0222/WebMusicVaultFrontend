import React, { useEffect, useRef } from "react";
import type { Song } from "@/services/song.services";
import { formatDuration } from "../formatDuration";
import SongCover from "../ui/SongCover";
import SongCardMoreOptionsModal from "../Modal/SongCardMoreOptionsModal";
import { EllipsisVertical, Pin } from "lucide-react";

interface SongCardProps {
  song: Song;
  handlePlayClick: (song: Song) => void;
  isActive: boolean;
  isPlaying: boolean;
  isAdmin: boolean;
  isPinned: boolean;
  handleEditSong: (song: Song) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onCloseMenu: () => void;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  handlePlayClick,
  isActive,
  isPlaying,
  isAdmin,
  isPinned,
  handleEditSong,
  isMenuOpen,
  onMenuToggle,
  onCloseMenu,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !menuRef.current ||
        !(event.target instanceof Node) ||
        menuRef.current.contains(event.target)
      ) {
        return;
      }
      onCloseMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <div
      className={`
  flex items-center gap-3 p-2 rounded-xl
  border transition-colors duration-200
  ${
    isActive
      ? "bg-purple-700/60 border-purple-400/30 shadow-[inset_0_0_14px_rgba(255,255,255,0.1)]"
      : isPinned
        ? "bg-white/10 border-amber-400/25 hover:bg-white/15 active:bg-white/20"
        : "bg-white/10 border-white/10 hover:bg-white/15 active:bg-white/20"
  }
`}
    >
      {/* Clickable play area */}
      <div
        onClick={() => {
          onCloseMenu();
          handlePlayClick(song);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCloseMenu();
            handlePlayClick(song);
          }
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
        title={isPlaying ? "Pause" : "Play"}
        className="flex items-center gap-3 grow min-w-0 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl"
      >
        {/* Song Cover / Icon */}
        {/* Song Cover / Icon */}
        <div className="relative shrink-0 w-14 h-14">
          <SongCover
            id={song._id}
            title={song.title}
            artist={song.artist}
            src={song.coverImageUrl}
            size="sm"
            className="w-full h-full"
          />

          {/* Pin Badge */}
          {isPinned && (
            <div
              className="
      absolute -top-1.5 -right-1.5
      z-30
      flex items-center justify-center
      w-6 h-6
      rounded-full
      bg-black/40
      border border-purple-400/70
      shadow-[0_0_12px_rgba(168,85,247,0.45)]
    "
            >
              <Pin className="w-3 h-3 text-purple-300" />
            </div>
          )}
          {/* Play/Pause Overlay */}
          <div
            className={`
      absolute inset-0 z-20 flex items-center justify-center rounded-xl transition-opacity duration-200 backdrop-blur-[2px] mobile-no-blur
      ${
        isActive
          ? "bg-black/50 opacity-100"
          : "bg-black/30 opacity-0 hover:opacity-100"
      }
    `}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-lg">
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="grow overflow-hidden">
          <h3
            className="text-sm font-semibold text-white truncate leading-tight"
            title={song.title}
          >
            {song.title.replace(/\.mp3$/i, "")}
          </h3>
          <p className="text-xs truncate mt-0.5 text-white/40 font-light tracking-wide">
            {song.artist}
          </p>
        </div>

        {/* Duration */}
        <div className="shrink-0 text-purple-200/70 text-xs font-mono font-medium select-none">
          {formatDuration(song.duration)}
        </div>
      </div>

      {/* Three-dot menu trigger */}
      <div ref={menuRef} className="relative shrink-0 flex items-center">
        <button
          type="button"
          onClick={onMenuToggle}
          title="More options"
          aria-label="More options"
          className="text-white/50 hover:text-white transition-colors duration-200"
        >
          <EllipsisVertical className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <SongCardMoreOptionsModal
            song={song}
            isAdmin={isAdmin}
            isPinned={isPinned}
            handleEditSong={handleEditSong}
            onClose={onMenuToggle}
          />
        )}
      </div>
    </div>
  );
};

export default SongCard;
