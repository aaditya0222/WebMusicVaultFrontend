"use client";
import { useState } from "react";
import { useAppSelector } from "@/store/hook";
import { ChevronDown, ChevronUp, ListStart } from "lucide-react";
import type { Song } from "@/services/song.services";
import SongCover from "@/components/ui/SongCover";
import { MAX_UP_NEXT_QUEUE_SIZE } from "@/reduxSlices/player.slice";

// When no Play Next queue is active, show the next songs from the current
// page's context. With an active queue, show only the queue (max 15).
const UPCOMING_CONTEXT_LIMIT = 5;

const UpNextSection = () => {
  const [expanded, setExpanded] = useState(false);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const upNextQueue = useAppSelector((state) => state.player.upNextQueue);
  const songsType = useAppSelector((state) => state.song.songsType);
  const songs = useAppSelector((state) => state.song[songsType]);

  if (!playingSong) return null;

  const playingIdx = songs.findIndex((s) => s._id === playingSong._id);
  const queuedIds = new Set(upNextQueue.map((s) => s._id));

  // Upcoming songs in natural context order, skipping the queue (those are
  // shown separately) and the currently playing song.
  const contextUpcoming: Song[] = [];
  if (playingIdx !== -1) {
    for (
      let i = playingIdx + 1;
      i < songs.length && contextUpcoming.length < UPCOMING_CONTEXT_LIMIT;
      i++
    ) {
      const s = songs[i];
      if (s._id !== playingSong._id && !queuedIds.has(s._id)) {
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
    <div className="mx-4 mb-1 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide play queue" : "Show play queue"}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
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
          <ChevronDown size={16} className="text-white/40 shrink-0" />
        ) : (
          <ChevronUp size={16} className="text-white/40 shrink-0" />
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
                  <ListStart
                    size={12}
                    className="text-orange-300 shrink-0"
                    aria-label="Queued via Play Next"
                  />
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