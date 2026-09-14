"use client";
import { useEffect } from "react";
import { Music2, Trash2, Upload, XCircle } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { DropZone } from "@/components/uploadPage/DropZone";
import { ProgressList } from "@/components/uploadPage/ProgressList";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAppSelector } from "@/store/hook";

export default function UploadPage() {
  const {
    songs,
    isRunning,
    addFiles,
    updateEntry,
    removeEntry,
    startUpload,
    cancelUpload,
    retryEntry,
    clearCompleted,
    reset,
  } = useUpload();
  const playingSong = useAppSelector((state) => state.player.playingSong);

  useEffect(() => {
    document.title = "Upload Songs | WmV";
  }, []);

  const idleCount = songs.filter((s) => s.status === "idle").length;
  const hasCompleted = songs.some(
    (s) => s.status === "done" || s.status === "exists",
  );
  const allDone =
    songs.length > 0 &&
    songs.every((s) => s.status !== "idle" && s.status !== "uploading");

  return (
    <ProtectedLayout>
      <div
        className={`min-h-screen bg-transparent flex justify-center items-start px-4 overflow-y-auto pt-4 ${
          playingSong ? "pb-44" : "pb-32"
        }`}
      >
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10"
              aria-hidden="true"
            >
              <Music2 size={20} className="text-purple-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-xl tracking-tight leading-tight truncate">
                Upload Songs
              </h1>
              <p className="text-purple-300/60 text-[10px] font-medium uppercase tracking-wider">
                Max 10 songs · Single queue
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-2.5 flex flex-col gap-4">
            <DropZone
              onFiles={addFiles}
              disabled={isRunning}
              currentCount={songs.length}
            />

            {songs.length > 0 && (
              <ProgressList
                songs={songs}
                isRunning={isRunning}
                onUpdate={updateEntry}
                onRemove={removeEntry}
                onRetry={retryEntry}
              />
            )}
          </div>

          {songs.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-3 flex flex-col sm:flex-row gap-3">
              {isRunning ? (
                <button
                  onClick={cancelUpload}
                  aria-label="Cancel current upload"
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold py-3 rounded-2xl transition-all"
                >
                  <XCircle size={16} aria-hidden="true" /> Cancel Upload
                </button>
              ) : (
                <button
                  onClick={startUpload}
                  disabled={!idleCount}
                  aria-label={`Upload ${idleCount} song${idleCount !== 1 ? "s" : ""}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600/70 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Upload size={16} aria-hidden="true" />
                  {`Upload ${idleCount} Song${idleCount !== 1 ? "s" : ""}`}
                </button>
              )}

              {hasCompleted && !isRunning && (
                <button
                  onClick={clearCompleted}
                  aria-label="Clear completed uploads"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm"
                >
                  <Trash2 size={14} aria-hidden="true" /> Clear done
                </button>
              )}

              {allDone && (
                <button
                  onClick={reset}
                  aria-label="Reset and start a new upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all text-sm"
                >
                  Start over
                </button>
              )}
            </div>
          )}

          <p className="text-purple-300/40 text-xs text-center pb-4">
            Each song is uploaded individually · May take up to 2 min per file
          </p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
