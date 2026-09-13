"use client";
import { useRef } from "react";
import { ListMusic, Plus } from "lucide-react";
import PlaylistCard from "@/components/PlaylistPage/PlaylistCard";
import type { PlaylistsResponse, Playlist } from "@/services/playlist.services";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  setMountCreatePlaylistModal,
  setAuthPromptString,
  setMountAuthPromptModal,
} from "@/reduxSlices/ui.slice";
import { useVirtualizer } from "@tanstack/react-virtual";

const MAX_PLAYLISTS = 10;

interface PlaylistListProps {
  playlists: PlaylistsResponse;
}

const LABEL_HEIGHT = 32;
const CARD_HEIGHT = 80;

function buildItems(playlists: PlaylistsResponse) {
  const items: { type: string; key: string; label?: string; playlist?: Playlist; height: number }[] = [];
  items.push({ type: "label", key: "default-label", label: "Default playlists", height: LABEL_HEIGHT });
  playlists.defaultPlaylists.forEach((p) => {
    items.push({ type: "card", key: p._id, playlist: p, height: CARD_HEIGHT });
  });
  if (playlists.personalPlaylists.length > 0) {
    items.push({ type: "label", key: "personal-label", label: "Your playlists", height: LABEL_HEIGHT });
    playlists.personalPlaylists.forEach((p) => {
      items.push({ type: "card", key: p._id, playlist: p, height: CARD_HEIGHT });
    });
  }
  return items;
}

const PlaylistList: React.FC<PlaylistListProps> = ({ playlists }) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const playingSong = useAppSelector((state) => state.player.playingSong);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const total =
    playlists.defaultPlaylists.length + playlists.personalPlaylists.length;
  const personalCount = playlists.personalPlaylists.filter(
    (p) => !p.isDefault,
  ).length;
  const atCap = personalCount >= MAX_PLAYLISTS;

  const handleCreateClick = () => {
    if (accessToken) {
      dispatch(setMountCreatePlaylistModal(true));
    } else {
      dispatch(setAuthPromptString("create playlists"));
      dispatch(setMountAuthPromptModal(true));
    }
  };

  const items = buildItems(playlists);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: (index) => items[index].height,
    getScrollElement: () => scrollableRef.current,
    overscan: 4,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-3 sm:mb-6 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-600/25 border border-white/10 flex items-center justify-center shrink-0">
                <ListMusic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              </div>
              <h1 className="text-base sm:text-2xl font-bold tracking-tight truncate">
                Playlists
              </h1>
            </div>
          <button
                type="button"
                onClick={handleCreateClick}
                disabled={atCap}
                title={atCap ? "Playlist limit reached (10). Delete one to create another." : undefined}
                aria-label="Create new playlist"
                className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 active:scale-[0.98] transition-all shadow-md shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New</span>
          </button>
        </div>
        <div className="mt-1.5 sm:mt-2 pl-10 sm:pl-[52px] flex items-center gap-1.5 text-[11px] sm:text-xs text-purple-300/70">
            <span>{total} total</span>
            <span className="text-white/20">•</span>
            <span className={atCap ? "text-red-300 font-medium" : ""} title="Personal playlists you can create">
              {personalCount}/{MAX_PLAYLISTS}
            </span>
            {atCap && <span className="text-red-300/80">(full)</span>}
          </div>
      </div>

      <div ref={scrollableRef} style={{ overflow: "auto", flex: 1, width: "100%" }}>
        <ul style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const item = items[vItem.index];
            return (
              <li
                key={item.key}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: vItem.size, transform: `translateY(${vItem.start}px)` }}
              >
                {item.type === "label" ? (
                  <p className="text-xs text-purple-300/60 uppercase tracking-widest mb-3">{item.label}</p>
                ) : (
                  <PlaylistCard playlist={item.playlist!} />
                )}
              </li>
            );
          })}
        </ul>
        {playingSong && <div className="h-20 lg:h-24" aria-hidden="true" />}
      </div>
    </div>
  );
};

export default PlaylistList;
