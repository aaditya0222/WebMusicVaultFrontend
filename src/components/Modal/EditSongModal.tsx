"use client";
import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { setLoading, setMountEditSongModal } from "@/reduxSlices/ui.slice";
import { fadeInPanel, fadeOutPanel } from "@/lib/animations";
import { X, Music2 } from "lucide-react";
import { SongChanges, updateSong } from "@/services/song.services";
import { updateSong as updateSongInRedux } from "@/reduxSlices/song.slice";
import { setPlayingSong } from "@/reduxSlices/player.slice";
import SongEditForm from "../Forms/EditSongForm";
import { showToast } from "@/hooks/useToast";
import getApiErrorMessage from "@/utils/getApiErrorMessage";

const EditSongModal = () => {
  const dispatch = useAppDispatch();
  const editPanelRef = useRef<HTMLDivElement>(null);

  const editableSong = useAppSelector((state) => state.song.editableSong);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const mountEditSongModal = useAppSelector(
    (state) => state.ui.mountEditSongModal,
  );

  // This effect only triggers an imperative animation — it never calls a
  // state setter, so it's outside the scope of react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!mountEditSongModal) return;
    if (editPanelRef.current) {
      fadeInPanel(editPanelRef.current);
    }
  }, [mountEditSongModal]);

  const handleClose = () => {
    if (!editPanelRef.current) {
      dispatch(setMountEditSongModal(false));
      return;
    }
    fadeOutPanel(editPanelRef.current, () => {
      dispatch(setMountEditSongModal(false));
    });
  };

  const handleSave = async (changes: SongChanges) => {
    dispatch(setLoading(true));
    try {
      const updatedSong = await updateSong(changes);
      dispatch(
        updateSongInRedux({
          songId: updatedSong._id,
          title: updatedSong.title,
          artist: updatedSong.artist,
          coverImageUrl: updatedSong.coverImageUrl,
          removeCoverImage: !!changes.removeCoverImage || !updatedSong.coverImageUrl,
        }),
      );
      if (playingSong && playingSong._id === updatedSong._id) {
        dispatch(
          setPlayingSong({
            ...playingSong,
            title: updatedSong.title,
            artist: updatedSong.artist,
            coverImageUrl: updatedSong.coverImageUrl,
          }),
        );
      }
      showToast({ message: "Song updated successfully", type: "success" });
      handleClose();
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Couldn't update the song. Please try again.",
      );
      if (message) {
        showToast({
          message,
          type: "error",
        });
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!mountEditSongModal || !editableSong) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-110 mobile-no-blur"
        aria-hidden="true"
      />

      <div
        ref={editPanelRef}
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
              <Music2 className="w-5 h-5 text-purple-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-200/70 tracking-[0.2em] uppercase font-medium">
                Admin Actions
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                Edit Song Details
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

        {/*
          key={editableSong._id} is the whole fix: whenever the song being
          edited changes, React unmounts the old form and mounts a brand new
          one. Its useState initializers read the new song directly — no
          effect, no setState-after-render, no stale-field bug.
        */}
        <SongEditForm
          key={editableSong._id}
          song={editableSong}
          onSave={handleSave}
          onCancel={handleClose}
        />
      </div>
    </>
  );
};

export default EditSongModal;