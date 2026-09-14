"use client";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setMountCreatePlaylistModal } from "@/reduxSlices/ui.slice";
import { fadeInPanel, fadeOutPanel } from "@/lib/animations";
import { X, ListMusic, Music2, Globe, Lock } from "lucide-react";
import {
  createPlaylist,
  CreatePlaylistInput,
} from "@/services/playlist.services";
import { setPlaylists } from "@/reduxSlices/song.slice";
import { showToast } from "@/hooks/useToast";

const CreatePlaylistModal = () => {
  const dispatch = useAppDispatch();
  const panelRef = useRef<HTMLDivElement>(null);

  const mountCreatePlaylistModal = useAppSelector(
    (state) => state.ui.mountCreatePlaylistModal,
  );
  const playlists = useAppSelector((state) => state.song.playlists);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"private" | "public">("private");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mountCreatePlaylistModal) return;
    // Reset the form every time it opens — the component stays mounted and
    // returns null when closed, so state used to linger between sessions.
    setName("");
    setDescription("");
    setStatus("private");
    if (panelRef.current) {
      fadeInPanel(panelRef.current);
    }
  }, [mountCreatePlaylistModal]);

  const handleClose = () => {
    if (!panelRef.current) {
      dispatch(setMountCreatePlaylistModal(false));
      return;
    }
    fadeOutPanel(panelRef.current, () => {
      dispatch(setMountCreatePlaylistModal(false));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const input: CreatePlaylistInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      };
      const newPlaylist = await createPlaylist(input);
      dispatch(
        setPlaylists({
          ...playlists,
          personalPlaylists: [...playlists.personalPlaylists, newPlaylist],
        }),
      );
      showToast({ message: "Playlist created successfully", type: "success" });
      handleClose();
    } catch (err) {
      const apiError = err as ApiError;
      showToast({
        message: apiError.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!mountCreatePlaylistModal) return null;

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
              <ListMusic className="w-5 h-5 text-purple-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-200/70 tracking-[0.2em] uppercase font-medium">
                Playlists
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                Create New Playlist
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

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-purple-200/80 tracking-wide">
              Playlist Name
            </label>
            <div className="relative">
              <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50 pointer-events-none" />
              <input
                type="text"
                value={name}
                placeholder="e.g., My Favourites"
                maxLength={30}
                minLength={3}
                pattern="[a-zA-Z0-9_ ]+"
                title="3-30 characters — letters, numbers, spaces & underscores only"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <p className="text-[10px] text-purple-200/50 mt-1">
              3-30 characters • letters, numbers, spaces &amp; underscores
              only
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-purple-200/80 tracking-wide">
              Description (optional)
            </label>
            <textarea
              value={description}
              placeholder="e.g., Songs I love to listen to"
              maxLength={100}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all resize-none"
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[10px] text-purple-200/50 mt-1">
              Optional • 3–100 characters
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-purple-200/80 tracking-wide">
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("private")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  status === "private"
                    ? "bg-purple-600/40 border-purple-400/50 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                <Lock className="w-4 h-4" />
                Private
              </button>
              <button
                type="button"
                onClick={() => setStatus("public")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  status === "public"
                    ? "bg-purple-600/40 border-purple-400/50 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                <Globe className="w-4 h-4" />
                Public
              </button>
            </div>
          </div>

          {/* Bottom Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-purple-900 rounded-xl hover:bg-purple-100 active:scale-[0.98] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ListMusic className="w-3.5 h-3.5" />
              {submitting ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePlaylistModal;
