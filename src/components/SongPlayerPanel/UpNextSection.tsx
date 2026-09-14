"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { removeFromUpNext } from "@/reduxSlices/player.slice";
import { showToast } from "@/hooks/useToast";
import { ChevronDown, ChevronUp, ListStart, X } from "lucide-react";
import type { Song } from "@/services/song.services";
import SongCover from "@/components/ui/SongCover";
import { MAX_UP_NEXT_QUEUE_SIZE } from "@/reduxSlices/player.slice";
import { usePathname } from "next/navigation";

// When no Play Next queue is active, show the next songs from the current
// page's context. With an active queue, show only the queue (max 15).
const UPCOMING_CONTEXT_LIMIT = 5;

const UpNextSection = ({ bgColor = "#1a0635" }: { bgColor?: string }) => {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const upNextQueue = useAppSelector((state) => state.player.upNextQueue);
  const songsType = useAppSelector((state) => state.song.songsType);
  const songs = useAppSelector((state) => state.song[songsType]);
  const repeat = useAppSelector((state) => state.player.repeat);
  const pathname = usePathname();

  if (!playingSong) return null;

  const playingIdx = songs.findIndex((s) => s._id === playingSong._id);
  const queuedIds = new Set(upNextQueue.map((s) => s._id));

  // Upcoming songs in natural context order, skipping the queue (those are
  // shown separately) and the currently playing song.
  // In repeat mode (not shuffle page) the player wraps to songs[0] at the end,
  // so the preview wraps too — keeping the displayed queue in lock-step with playback.
  const isRepeatMode = repeat === "repeat" && pathname !== "/shuffle";
  const contextUpcoming: Song[] = [];
  if (playingIdx !== -1) {
    for (let i = 1; i <= UPCOMING_CONTEXT_LIMIT; i++) {
      let idx = playingIdx + i;
      if (isRepeatMode) {
        idx = idx % songs.length;
      } else if (idx >= songs.length) {
        break;
      }
      const s = songs[idx];
      if (s && s._id !== playingSong._id && queuedIds.has(s._id) == false) {
        contextUpcoming.push(s);
      }
    }
  }

  const isQueueActive = upNextQueue.length > 0;
  // The very next song: a Play Next pick always wins over the context order.
  const nextSong = upNextQueue[0] ?? contextUpcoming[0] ?? null;
  // Collapsed shows only nextSong; expanded shows the full upcoming list —
  // the Play Next queue when active (capped at MAX_UP_NEXT_QUEUE_SIZE),
  // otherwise the next songs from the current context.
  const expandedList = isQueueActive
    ? upNextQueue.slice(0, MAX_UP_NEXT_QUEUE_SIZE)
    : contextUpcoming;

  if (!nextSong) return null;

  return (
    <div className="mx-4 mb-1 rounded-2xl border border-white/10 overflow-hidden" style={{ backgroundColor: bgColor + "dd" }}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide play queue" : "Show play queue"}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden">
          <SongCover
            id={nextSong._id}
            title={nextSong.title}
            artist={nextSong.artist}
            src={nextSong.coverImageUrl}
            size="sm"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-purple-300/60 font-semibold flex items-center gap-1">
            <ListStart className="w-3 h-3" aria-hidden="true" />
            Up next
            {isQueueActive && ` · ${upNextQueue.length}/${MAX_UP_NEXT_QUEUE_SIZE}`}
          </p>
          <p className="text-white text-sm font-semibold truncate leading-tight">
            {nextSong.title.replace(/\.mp3$/i, "")}
          </p>
          <p className="text-white/40 text-xs truncate">{nextSong.artist}</p>
        </div>
        {expanded ? (
          <ChevronDown size={20} className="text-white/40 shrink-0" />
        ) : (
          <ChevronUp size={20} className="text-white/40 shrink-0" />
        )}
      </button>

      {expanded && expandedList.length > 0 && (
        <ul className="max-h-56 overflow-y-auto border-t border-white/10">
          {expandedList.map((song, i) => {
            const fromQueue = isQueueActive && i < upNextQueue.length;
            return (
              <li key={song._id} className="flex items-center gap-3 px-3 py-2">
                <span className="text-xs text-purple-300/60 w-4 text-right font-mono shrink-0">
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-md shrink-0 overflow-hidden">
                  <SongCover
                    id={song._id}
                    title={song.title}
                    artist={song.artist}
                    src={song.coverImageUrl}
                    size="sm"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-xs font-medium truncate">
                    {song.title.replace(/\.mp3$/i, "")}
                  </p>
                  <p className="text-white/40 text-[10px] truncate">
                    {song.artist}
                  </p>
                </div>
                {fromQueue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromUpNext(song._id));
                      showToast({ message: `Removed "${song.title}" from queue`, type: "success" });
                    }}
                    aria-label={`Remove ${song.title} from queue`}
                    className="text-white/40 hover:text-red-400 transition-colors shrink-0 p-0.5"
                  >
                    <X size={18} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpNextSection;