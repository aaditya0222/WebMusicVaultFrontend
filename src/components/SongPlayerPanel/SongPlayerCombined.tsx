"use client";
import React, { useRef } from "react";
import DeleteConfirmation from "@/components/Modal/DeleteConfirmationModal";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  setPlaying,
  setExpandedPanelOpen,
  setExpandedPanelTrigger,
} from "@/reduxSlices/player.slice";
import DownloadConfirmation from "@/components/Modal/DownloadConfirmationModal";
import ShareSongModal from "@/components/Modal/ShareSongModal";
import AuthPromptModal from "@/components/Modal/AuthPromptModal";
import MiniPlayer from "@/components/SongPlayerPanel/MiniPlayer";
import ExpandedPlayer from "@/components/SongPlayerPanel/ExpandedPlayer";

const SongPlayerCombined: React.FC = () => {
  const dispatch = useAppDispatch();
  const playing = useAppSelector((state) => state.player.playing);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const actionSong = useAppSelector((state) => state.ui.actionSong);

  const mountDeleteConfirmation = useAppSelector(
    (state) => state.ui.mountDeleteConfirmation,
  );
  const mountDownloadConfirmation = useAppSelector(
    (state) => state.ui.mountDownloadConfirmation,
  );
  const mountShareModal = useAppSelector((state) => state.ui.mountShareModal);
  const mountAuthPromptModal = useAppSelector(
    (state) => state.ui.mountAuthPromptModal,
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const songsType = useAppSelector((state) => state.song.songsType);
  const songs = useAppSelector((state) => state.song[songsType]);
  const { handleAudioEnded, moveToNextSong, moveToPreviousSong } =
    useAudioPlayer({ audioRef, songs });

  return (
    <div>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        preload="metadata"
        hidden
      />

      {/* ── MiniPlayer ── */}
      {playingSong && (
        <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 lg:left-[calc(50%+128px)] lg:-translate-x-1/2 lg:w-125 z-60 lg:rounded-2xl lg:overflow-hidden lg:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] lg:border lg:border-purple-500/20">
          <MiniPlayer
            audioRef={audioRef}
            handlePlayPause={() => {
              dispatch(setPlaying(!playing));
            }}
            onExpand={() => {
              dispatch(setExpandedPanelTrigger());
              dispatch(setExpandedPanelOpen(true));
            }}
          />
        </div>
      )}

      <ExpandedPlayer
        audioRef={audioRef}
        handlePlayPause={() => {
          dispatch(setPlaying(!playing));
        }}
        moveToNextSong={moveToNextSong}
        moveToPreviousSong={moveToPreviousSong}
      />

      {/* Delete Confirmation */}
      {mountDeleteConfirmation && actionSong && (
        <DeleteConfirmation
          title={actionSong.title}
          songId={actionSong._id}
          moveToNextSong={
            playingSong && actionSong._id === playingSong._id
              ? moveToNextSong
              : () => {}
          }
        />
      )}

      {mountDownloadConfirmation && (actionSong || playingSong) && (
        <DownloadConfirmation
          title={(actionSong || playingSong)!.title}
          song={actionSong || playingSong!}
        />
      )}

      {mountShareModal && playingSong && (
        <ShareSongModal songId={playingSong._id} title={playingSong.title} />
      )}
      {mountAuthPromptModal && <AuthPromptModal />}
    </div>
  );
};

export default SongPlayerCombined;
