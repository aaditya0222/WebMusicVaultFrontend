"use client";
import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { ChevronDown, Pin } from "lucide-react";
import gsap from "gsap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useHandleSliderChange } from "@/components/useHandleSliderChange";
import SongTitleMarquee from "@/components/SongPlayerPanel/SongTitleMarquee";
import ProgressSlider from "@/components/SongPlayerPanel/ProgressSlider";
import PanelBottomControls from "@/components/SongPlayerPanel/PanelBottomControls";
import UpNextSection from "@/components/SongPlayerPanel/UpNextSection";
import PanelTopControls from "@/components/SongPlayerPanel/PanelTopControls";
import { setExpandedPanelOpen } from "@/reduxSlices/player.slice";
import { fadeInExpandedPanel, fadeOutExpandedPanel } from "@/lib/animations";
import SongCover, {
  getSongGradientIndex,
  gradientColors,
} from "@/components/ui/SongCover";

interface ExpandedPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handlePlayPause: () => void;
  moveToNextSong: () => void;
  moveToPreviousSong: () => void;
}

const ExpandedPlayer = ({
  audioRef,
  handlePlayPause,
  moveToNextSong,
  moveToPreviousSong,
}: ExpandedPlayerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const playingSong = useAppSelector((state) => state.player.playingSong);
  const playing = useAppSelector((state) => state.player.playing);
  const duration = useAppSelector((state) => state.player.duration);
  const currentTime = useAppSelector((state) => state.player.currentTime);
  const repeat = useAppSelector((state) => state.player.repeat);
  const shuffle = useAppSelector((state) => state.player.shuffle);
  const downloading = useAppSelector((state) => state.ui.downloading);
  const expandedPanelOpen = useAppSelector(
    (state) => state.player.expandedPanelOpen,
  );

  const handleSliderChange = useHandleSliderChange(audioRef);

  // Precomputed palette from DB (extracted at upload time) — no live Vibrant run
  const bgColor = useMemo(() => {
    if (!playingSong) return "#1a0635";

    return (
      playingSong.palette?.darkVibrant ??
      playingSong.palette?.vibrant ??
      gradientColors[
        getSongGradientIndex(playingSong._id, playingSong.title)
      ] ??
      "#1a0635"
    );
  }, [playingSong]);

  const isMount = useRef(true);

  useEffect(() => {
    if (!panelRef.current) return;
    if (isMount.current) {
      isMount.current = false;
      if (!expandedPanelOpen) {
        gsap.set(panelRef.current, { y: "100%", opacity: 0 });
      } else {
        fadeInExpandedPanel(panelRef.current);
      }
      return;
    }

    if (expandedPanelOpen) {
      fadeInExpandedPanel(panelRef.current);
    } else {
      fadeOutExpandedPanel(panelRef.current);
    }
  }, [expandedPanelOpen]);
  const pinnedSongs = useAppSelector((state) => state.song.pinnedSongs);

  if (!playingSong) return null;

  const pinnedSongsSet = new Set(pinnedSongs.map((song) => song._id));
  const isPinned = Boolean(pinnedSongsSet.has(playingSong._id));

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  return (
    <div
      ref={panelRef}
      style={{
        backgroundColor: bgColor,
        transition: "background-color 0.8s ease",
      }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col text-white overflow-hidden gpu-hint",
        !expandedPanelOpen && "opacity-0 translate-y-full pointer-events-none",
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-10 pb-2 shrink-0">
          <button
            onClick={() => dispatch(setExpandedPanelOpen(false))}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <ChevronDown size={28} />
          </button>
          <p className="text-white/50 text-xs uppercase tracking-widest font-medium">
            Now Playing
          </p>
          <div className="w-8" />
        </div>

        {/* Cover Art */}
        <div className="flex-1 flex items-center justify-center px-6 min-h-0">
          <div
            className={cn(
              "relative w-full max-w-sm rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] aspect-square border transition-colors duration-200",
              isPinned ? "border-amber-400/25" : "border-transparent",
            )}
            style={{ maxHeight: "100%" }}
          >
            <SongCover
              id={playingSong._id}
              title={playingSong.title}
              artist={playingSong.artist}
              src={playingSong.coverImageUrl}
              size="lg"
              className="w-full h-full"
            />

            {isPinned && (
              <div
                className="
                  absolute top-3 right-3
                  z-30
                  flex items-center justify-center
                  w-9 h-9
                  rounded-full
                  bg-black/40
                  backdrop-blur-xl mobile-no-blur
                  border border-purple-400/70
                  shadow-[0_0_14px_rgba(168,85,247,0.5)]
                "
              >
                <Pin className="w-4 h-4 text-purple-300" />
              </div>
            )}
          </div>
        </div>

        {/* Player controls */}
        <div className="shrink-0 pt-4 pb-6 px-1">
          <UpNextSection />
          <PanelTopControls
            audioRef={audioRef}
            downloading={downloading}
            panelRef={panelRef}
            fadeOutPanel={fadeOutExpandedPanel}
            songId={playingSong._id}
            isLiked={playingSong.isLiked}
            showCloseBtn={false}
          />
          <hr className="border-white/10 mx-4 mb-1" />
          <SongTitleMarquee playingSong={playingSong} />
          <ProgressSlider
            duration={duration}
            currentTime={currentTime}
            handleSliderChange={handleSliderChange}
          />
          <PanelBottomControls
            audioRef={audioRef}
            currentTime={currentTime}
            handlePlayPause={handlePlayPause}
            moveToPreviousSong={moveToPreviousSong}
            moveToNextSong={moveToNextSong}
            playing={playing}
            duration={duration}
            repeat={repeat}
            shuffle={shuffle}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpandedPlayer;
