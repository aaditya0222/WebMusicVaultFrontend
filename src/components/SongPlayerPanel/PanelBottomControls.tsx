import React from "react";
import DisplayTime from "./DisplayTime";
import ShuffleBtn from "./ControlButtons/ShuffleBtn";
import MoveToSong from "./ControlButtons/MoveToSongBtn";
import PlayPauseSong from "./ControlButtons/PlayPauseSongBtn";
import RepeatBtn from "./ControlButtons/RepeatBtn";
import { repeatType } from "@/hooks/useAudioPlayer";

interface PanelBottomControlsProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  shuffle: boolean;
  playing: boolean;
  repeat: repeatType;
  duration: number;
  moveToPreviousSong: () => void;
  moveToNextSong: () => void;
  handlePlayPause: () => void;
}
const PanelBottomControls: React.FC<PanelBottomControlsProps> = ({
  audioRef,
  currentTime,
  shuffle,
  moveToPreviousSong,
  moveToNextSong,
  handlePlayPause,
  playing,
  repeat,
  duration,
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <DisplayTime currentTime={currentTime} />
      <div
        className="
            w-[90%] flex items-center justify-center gap-2 sm:gap-3
            lg:gap-4 lg:h-[80px]
          "
      >
        <ShuffleBtn shuffle={shuffle} />
        <MoveToSong toNext={false} moveToFunction={moveToPreviousSong} />
        <PlayPauseSong handlePlayPause={handlePlayPause} playing={playing} />
        <MoveToSong moveToFunction={moveToNextSong} />
        <RepeatBtn repeat={repeat} />
      </div>

      <DisplayTime currentTime={currentTime} duration={duration} />
    </div>
  );
};

export default PanelBottomControls;
