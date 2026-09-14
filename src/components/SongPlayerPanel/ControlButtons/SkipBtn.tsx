import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";

interface SkipBtnProps {
  /** true = forward +10s, false = rewind -10s */
  toNext: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const SKIP_SECONDS = 10;

// Seek relative to the current position — clamped so it can never jump past
// the end (which would fire `ended`) or before the start.
const SkipBtn: React.FC<SkipBtnProps> = ({ toNext, audioRef }) => {
  const handleSkip = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const next = audio.currentTime + (toNext ? SKIP_SECONDS : -SKIP_SECONDS);
    audio.currentTime = Math.max(0, Math.min(next, audio.duration - 0.1));
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      aria-label={toNext ? "Skip forward 10 seconds" : "Rewind 10 seconds"}
      title={toNext ? "Forward 10s" : "Back 10s"}
      className="text-white hover:text-purple-400 active:scale-95 transition-colors duration-300 flex flex-col items-center"
    >
      {toNext ? (
        <RotateCw size={24} className="stroke-current" />
      ) : (
        <RotateCcw size={24} className="stroke-current" />
      )}
      <span className="text-[9px] font-bold leading-none mt-0.5">
        {toNext ? "+10" : "-10"}
      </span>
    </button>
  );
};

export default SkipBtn;