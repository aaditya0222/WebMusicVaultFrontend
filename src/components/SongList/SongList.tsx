import { useRef, useState } from "react";
import type { Song } from "../../services/song.services";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import SongCard from "./SongCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setEditableSong } from "@/reduxSlices/song.slice";
import { setMountEditSongModal } from "@/reduxSlices/ui.slice";
import { ChevronDown, ChevronUp } from "lucide-react";

const SongList = ({
  songs,
  handlePlayClick,
  playingSong,
  playing,
  isTemp = false,
}: {
  songs: Song[];
  handlePlayClick: (song: Song) => void;
  playingSong: Song | null;
  playing: boolean;
  isTemp?: boolean;
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollableElemRef = useRef<HTMLDivElement>(null);
  const loading = useAppSelector((state) => state.ui.loading);
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector((state) => state.auth.user?.role) === "admin";

  const hasMoreSongs = useAppSelector(
    (state) => state.song[isTemp ? "tempHasMoreSongs" : "hasMoreSongs"],
  );
  useInfiniteScroll({ isTemp, sentinelRef });
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: songs.length,
    estimateSize: () => 90,
    getScrollElement: () => scrollableElemRef.current,
    overscan: 4,
  });

  const handleEditSong = (song: Song) => {
    dispatch(setMountEditSongModal(true));
    dispatch(setEditableSong({ ...song, isTemp }));
  };

  const [openMenuSongId, setOpenMenuSongId] = useState<string | null>(null);
  const pinnedSongs = useAppSelector((state) => state.song.pinnedSongs);
  const pinnedSongsSet = new Set(pinnedSongs.map((song) => song._id));

  // ── Floating action button (jump-to-playing / scroll-to-top) ──
  const [scrolledFar, setScrolledFar] = useState(false);

  const playingIdx = playingSong
    ? songs.findIndex((s) => s._id === playingSong._id)
    : -1;

  const vRange = virtualizer.range;
  const playingOffscreen =
    playingIdx !== -1 &&
    !!vRange &&
    (playingIdx < vRange.startIndex || playingIdx > vRange.endIndex);

  // Jump-to-playing only when NOT scrolled far — scroll-to-top wins first,
  // then after returning to top the ▼ jump arrow points at the song below.
  const jumpMode = !scrolledFar && playingOffscreen;
  const showFab = scrolledFar || playingOffscreen;

  const handleFabClick = () => {
    const el = scrollableElemRef.current;
    if (!el) return;
    if (jumpMode && playingIdx !== -1) {
      // All rows are a fixed 90px, so the offset math is exact.
      // Center the playing row in the viewport — smoothly, not a teleport.
      const itemSize = 90;
      const target = Math.max(
        0,
        Math.min(
          playingIdx * itemSize + itemSize / 2 - el.clientHeight / 2,
          el.scrollHeight - el.clientHeight,
        ),
      );
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTo({ top: 0, behavior: "smooth" });
      setScrolledFar(false);
    }
  };

  return (
    <div
      ref={scrollableElemRef}
      onScroll={(e) => setScrolledFar(e.currentTarget.scrollTop > 400)}
      style={{
        overflow: "auto",
        flex: 1,
        width: "100%",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <ul
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const song = songs[virtualItem.index];
          const isActive = playingSong?._id === song._id;
          return (
            <li
              key={song._id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                zIndex: openMenuSongId === song._id ? 9999 : 1,
              }}
            >
              <SongCard
                handlePlayClick={handlePlayClick}
                song={song}
                isActive={isActive}
                isPlaying={isActive && playing}
                isAdmin={isAdmin}
                handleEditSong={handleEditSong}
                isPinned={pinnedSongsSet.has(song._id)}
                isMenuOpen={openMenuSongId === song._id}
                onMenuToggle={() =>
                  setOpenMenuSongId(
                    openMenuSongId === song._id ? null : song._id,
                  )
                }
                onCloseMenu={() => setOpenMenuSongId(null)}
              />
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} className="h-px w-full bg-transparent"></div>

      {/* ── Inline loader (loading more) ── */}
      {loading && songs.length >= 10 && (
        <p className="text-center mt-4 text-purple-200">
          <i className="ri-loader-2-line text-purple-300 text-6xl animate-spin inline-block" />
        </p>
      )}

      {/* ── End of results ── */}
      {!hasMoreSongs && songs.length > 0 && (
        <p className="text-center text-purple-200 mb-2">
          You have reached the end of the results.
        </p>
      )}

      {/* ── Spacer so the last card is never hidden behind the fixed MiniPlayer ── */}
      {playingSong && <div className="h-20 lg:h-24" aria-hidden="true" />}

      {/* ── Floating action button: jump to playing song OR scroll to top ── */}
      {showFab && (
        <button
          type="button"
          onClick={handleFabClick}
          aria-label={jumpMode ? "Jump to playing song" : "Scroll to top"}
          title={jumpMode ? "Jump to playing song" : "Scroll to top"}
          className={`fixed ${
            playingSong ? "bottom-36 lg:bottom-8" : "bottom-24 lg:bottom-6"
          } right-5 z-40 p-3 rounded-full bg-purple-600/30 backdrop-blur-md mobile-no-blur border border-purple-400/30 text-purple-100 shadow-xl hover:bg-purple-500/50 hover:text-white transition-transform active:scale-95 animate-in fade-in zoom-in-95 duration-150`}
        >
          {jumpMode ? (
            // Arrow points toward the playing song's position in the list
            playingIdx < (virtualizer.range?.startIndex ?? 0) ? (
              <ChevronUp size={24} />
            ) : (
              <ChevronDown size={24} />
            )
          ) : (
            <ChevronUp size={24} />
          )}
        </button>
      )}
    </div>
  );
};

export default SongList;
