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
      className="text-white/60 hover:text-white active:scale-95 transition-all p-1"
    >
      {toNext ? (
        <RotateCw size={22} className="stroke-current" />
      ) : (
        <RotateCcw size={22} className="stroke-current" />
      )}
    </button>
  );
};

export default SkipBtn;