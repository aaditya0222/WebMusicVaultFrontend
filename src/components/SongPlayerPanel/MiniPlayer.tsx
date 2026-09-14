"use client";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { Play, Pause, ChevronUp, Pin } from "lucide-react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import AddToFav from "@/components/SongPlayerPanel/PanelButtons/AddToFav";
import SongCover from "@/components/ui/SongCover";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { fadeInMiniPlayer, fadeOutMiniPlayer } from "@/lib/animations";
import { setPlaying, setPlayingSong } from "@/reduxSlices/player.slice";
interface MiniPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handlePlayPause: () => void;
  onExpand: () => void;
}

const MiniPlayer = ({
  audioRef,
  handlePlayPause,
  onExpand,
}: MiniPlayerProps) => {
  const dispatch = useAppDispatch();
  const panelRef = useRef<HTMLDivElement>(null);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const playing = useAppSelector((state) => state.player.playing);
  const currentTime = useAppSelector((state) => state.player.currentTime);
  const duration = useAppSelector((state) => state.player.duration);
  const miniPanelOpen = useAppSelector((state) => state.player.miniPanelOpen);

  const isMount = useRef(true);

  useEffect(() => {
    if (!panelRef.current) return;
    if (isMount.current) {
      isMount.current = false;
      if (!miniPanelOpen) {
        gsap.set(panelRef.current, { y: "100%", opacity: 0 });
      } else {
        fadeInMiniPlayer(panelRef.current);
      }
      return;
    }

    if (miniPanelOpen) {
      fadeInMiniPlayer(panelRef.current);
    } else {
      fadeOutMiniPlayer(panelRef.current, () => {
        dispatch(setPlayingSong(null));
        dispatch(setPlaying(false));
      });
    }
  }, [miniPanelOpen, dispatch]);
  const pinnedSongs = useAppSelector((state) => state.song.pinnedSongs);
  if (!playingSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const pinnedSongsSet = new Set(pinnedSongs.map((song) => song._id));
  const isPinned = Boolean(pinnedSongsSet.has(playingSong._id));

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "relative w-full bg-[#1a0635] border-t shadow-[0_-4px_20px_rgba(0,0,0,0.4)] cursor-pointer select-none transition-colors duration-200 gpu-hint",
        isPinned ? "border-amber-400/25" : "border-purple-500/20",
        !miniPanelOpen && "opacity-0 translate-y-full pointer-events-none",
      )}
      onClick={onExpand}
    >
      {/* Progress bar — Patch 4: scaleX (compositor) instead of width (layout) */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10 overflow-hidden">
        <div
          className="h-full w-full origin-left bg-gradient-to-r from-orange-400 to-purple-500 transition-transform duration-300"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      <div className="flex items-center gap-3 px-3 py-2">
        {/* Cover with pin badge */}
        <div className="relative shrink-0 w-14 h-14">
          <SongCover
            id={playingSong._id}
            title={playingSong.title}
            artist={playingSong.artist}
            src={playingSong.coverImageUrl}
            size="sm"
            className="w-full h-full rounded-lg shadow-md"
          />

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
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate leading-tight">
            {playingSong.title.replace(/\.mp3$/i, "")}
          </p>
          <p className="text-white/50 text-xs truncate mt-0.5">
            {playingSong.artist}
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex items-center gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <AddToFav
            songId={playingSong._id}
            isLiked={playingSong.isLiked}
            audioRef={audioRef}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-purple-600 flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            {playing ? (
              <Pause size={18} className="text-white" fill="white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" fill="white" />
            )}
          </button>
        </div>

        <ChevronUp size={18} className="text-white/30 shrink-0" />
      </div>
    </div>
  );
};

export default MiniPlayer;
