"use client";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  setMountAddToPlaylistModal,
  setMountCreatePlaylistModal,
} from "@/reduxSlices/ui.slice";
import { fadeInPanel, fadeOutPanel } from "@/lib/animations";
import { X, ListPlus, ListMusic, Check, Loader2 } from "lucide-react";
import { addSongs, getPlaylists } from "@/services/playlist.services";
import { setPlaylists } from "@/reduxSlices/song.slice";
import { incrementPlaylistSongCount } from "@/reduxSlices/song.slice";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { showToast } from "@/hooks/useToast";

const AddToPlaylistModal = () => {
  const dispatch = useAppDispatch();
  const panelRef = useRef<HTMLDivElement>(null);

  const mountAddToPlaylistModal = useAppSelector(
    (state) => state.ui.mountAddToPlaylistModal,
  );
  const actionSong = useAppSelector((state) => state.ui.actionSong);
  const playlists = useAppSelector((state) => state.song.playlists);

  const [addingId, setAddingId] = useState<string | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    if (!mountAddToPlaylistModal || !actionSong) return;
    if (playlists.personalPlaylists.length > 0) return;

    setLoadingPlaylists(true);
    getPlaylists()
      .then((data) => dispatch(setPlaylists(data)))
      .catch((err) => {
        showToast({
          message:
            err instanceof Error ? err.message : "Failed to load playlists",
          type: "error",
        });
      })
      .finally(() => setLoadingPlaylists(false));
  }, [mountAddToPlaylistModal, actionSong?._id]);

  useEffect(() => {
    if (!mountAddToPlaylistModal) return;
    if (panelRef.current) {
      fadeInPanel(panelRef.current);
    }
  }, [mountAddToPlaylistModal]);

  const handleClose = () => {
    if (!panelRef.current) {
      dispatch(setMountAddToPlaylistModal(false));
      return;
    }
    fadeOutPanel(panelRef.current, () => {
      dispatch(setMountAddToPlaylistModal(false));
    });
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!actionSong || addingId) return;
    setAddingId(playlistId);
    try {
      const result = await addSongs(playlistId, [actionSong._id]);
      const skipped = result.skipped?.[0];
      if (skipped) {
        showToast({
          message: skipped.title
            ? `"${skipped.title}" is already in the playlist`
            : skipped.message,
          type: "info",
        });
      } else {
        showToast({
          message: `Added "${actionSong.title}" to playlist`,
          type: "success",
        });
        dispatch(incrementPlaylistSongCount(playlistId));
      }
      handleClose();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (message) {
        showToast({
          message,
          type: "error",
        });
      }
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateNew = () => {
    handleClose();
    dispatch(setMountCreatePlaylistModal(true));
  };

  if (!mountAddToPlaylistModal || !actionSong) return null;

  const personalPlaylists = playlists.personalPlaylists.filter(
    (p) => !p.isDefault,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-110 mobile-no-blur"
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        style={{ transform: "translateY(100%)", opacity: 0 }}
        className="fixed bottom-0 left-0 w-full max-w-5xl mx-auto right-0 bg-gradient-to-tr from-purple-900/95 via-purple-800/95 to-purple-700/95 border-t border-white/10 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.4)] text-white z-120 py-4 px-4 lg:py-5 lg:px-6 lg:rounded-2xl lg:bottom-6 gpu-hint"
      >
        {/* Drag handle (mobile affordance) */}
        <div className="flex justify-center mb-3 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Panel Top Header Controls */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <ListPlus className="w-5 h-5 text-purple-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-200/70 tracking-[0.2em] uppercase font-medium">
                Add to Playlist
              </span>
              <h2 className="text-base font-bold text-white leading-tight truncate max-w-[240px]">
                {actionSong.title.replace(/\.mp3$/i, "")}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <hr className="border-white/10 mb-4" />

        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {loadingPlaylists ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="w-6 h-6 text-purple-300 animate-spin" />
              <p className="text-sm text-white/50">Loading your playlists...</p>
            </div>
          ) : personalPlaylists.length === 0 ? (
            <p className="text-sm text-white/50 text-center py-6">
              You don&apos;t have any playlists yet.
            </p>
          ) : (
            personalPlaylists.map((playlist) => (
              <button
                key={playlist._id}
                type="button"
                disabled={addingId !== null}
                onClick={() => handleAddToPlaylist(playlist._id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                  <ListMusic className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {playlist.name}
                  </span>
                  <span className="text-xs text-purple-300">
                    {playlist.songs} songs
                  </span>
                </div>
                {addingId === playlist._id ? (
                  <Loader2 className="w-4 h-4 text-purple-300 animate-spin shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-purple-300/40 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-white/10 border border-dashed border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
        >
          <ListPlus className="w-3.5 h-3.5" />
          Create new playlist
        </button>
      </div>
    </>
  );
};

export default AddToPlaylistModal;
