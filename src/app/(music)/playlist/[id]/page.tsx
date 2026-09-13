"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { usePlaySong } from "@/hooks/usePlaySong";
import SongList from "@/components/SongList/SongList";
import SongListSkeleton from "@/components/SongList/SongListSkeleton";
import {
  setTempSongs,
  replaceTempSongs,
  setTempHasMoreSongs,
  setTempNextCursor,
  setSongsType,
} from "@/reduxSlices/song.slice";
import { setExpandedPanelOpen } from "@/reduxSlices/player.slice";
import { setLoading } from "@/reduxSlices/ui.slice";
import {
  getPlaylistSongs,
  PlaylistWithSongs,
} from "@/services/playlist.services";
import { Song } from "@/services/song.services";
import { ArrowLeft, ListMusic, Home } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Link from "next/link";
import { showToast } from "@/hooks/useToast";

const PlaylistPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [playlistInfo, setPlaylistInfo] =
    useState<Partial<PlaylistWithSongs> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const tempSongs = useAppSelector((state) => state.song.tempSongs);
  const loading = useAppSelector((state) => state.ui.loading);
  const playing = useAppSelector((state) => state.player.playing);
  const playingSong = useAppSelector((state) => state.player.playingSong);

  const deleting = useAppSelector((state) => state.ui.deleting);

  const tempHasMoreSongs = useAppSelector(
    (state) => state.song.tempHasMoreSongs,
  );
  const tempNextCursor = useAppSelector((state) => state.song.tempNextCursor);
  const tempTriggerFetch = useAppSelector(
    (state) => state.song.tempTriggerFetch,
  );
  const shouldFetchUser = useAppSelector((state) => state.auth.shouldFetchUser);
  const cachedSongCount = useAppSelector((state) =>
    state.song.playlists.personalPlaylists.find((p) => p._id === id)?.songs,
  );
  const { handlePlayClick } = usePlaySong();

  // Clear state on unmount or id change
  useEffect(() => {
    dispatch(setSongsType("tempSongs"));
    return () => {
      dispatch(replaceTempSongs([]));
      dispatch(setTempHasMoreSongs(true));
      dispatch(setTempNextCursor(undefined));
      dispatch(setExpandedPanelOpen(false));
      dispatch(setLoading(false));
    };
  }, [dispatch, id]);

  // Initial fetch
  useEffect(() => {
    if (!id || shouldFetchUser) return;
    const fetchInitialSongs = async () => {
      try {
        dispatch(setLoading(true));
        setErrorMsg(null);
        const data = await getPlaylistSongs(id, { limit: 10 });
        if (data.songs && data.songs.length > 0) {
          dispatch(replaceTempSongs(data.songs as unknown as Song[]));
          dispatch(setTempNextCursor(data.nextCursor));
          dispatch(setTempHasMoreSongs(data.hasMoreSongs));
        } else {
          dispatch(replaceTempSongs([]));
          dispatch(setTempHasMoreSongs(false));
        }
        setPlaylistInfo({
          name: data.name,
          owner: data.owner,
          description: data.description,
          isDefault: data.isDefault,
        });
        document.title = `${data.name} | WmV`;
      } catch (error) {
        console.error(error);
        const status = (error as ApiError)?.response?.status;
        setErrorMsg(
          status === 404
            ? "This playlist doesn't exist or is no longer available."
            : "Couldn't load this playlist. Please check your connection and try again.",
        );
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchInitialSongs();
  }, [dispatch, id, shouldFetchUser, retryTick]);

  // Infinite Scroll fetch
  useEffect(() => {
    if (!id || !tempNextCursor || !tempHasMoreSongs || loading) return;

    const fetchMoreSongs = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getPlaylistSongs(id, {
          limit: 10,
          cursor: tempNextCursor as string,
        });
        if (data.songs && data.songs.length > 0) {
          dispatch(setTempSongs(data.songs as unknown as Song[]));
          dispatch(setTempNextCursor(data.nextCursor));
          dispatch(setTempHasMoreSongs(data.hasMoreSongs));
        } else {
          dispatch(setTempHasMoreSongs(false));
        }
      } catch (error) {
        console.error(error);
        showToast({
          message: "Couldn't load more songs. Please try again.",
          type: "error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMoreSongs();
  }, [tempTriggerFetch, id, dispatch]);

  return (
    <ProtectedLayout>
      <>
        {/* Header */}
        <div className="mb-3 sm:mb-6 bg-white/10 px-4 py-3 sm:p-6 rounded-xl sm:rounded-lg shadow-lg">
          <button
            onClick={() => router.push("/playlist")}
            aria-label="Back to Playlists"
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-2 sm:mb-3"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm hidden sm:inline">Back to Playlists</span>
          </button>
          {playlistInfo ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl sm:text-3xl font-bold break-words leading-tight min-w-0">{playlistInfo.name}</h1>
                {typeof cachedSongCount === "number" && (
                  <span className="shrink-0 text-xs text-purple-300 mt-1 sm:mt-2 whitespace-nowrap">
                    {cachedSongCount} / 50 songs
                  </span>
                )}
              </div>
              {playlistInfo.description && (
                <p className="text-gray-300 text-sm sm:text-base mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2">{playlistInfo.description}</p>
              )}
            </>
          ) : errorMsg ? (
            <div className="py-2">
              <p className="text-red-300 text-sm">{errorMsg}</p>
              {!errorMsg.includes("doesn't exist") && (
                <button
                  type="button"
                  onClick={() => setRetryTick((t) => t + 1)}
                  className="mt-3 px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div className="h-12 bg-white/20 rounded animate-pulse w-1/3"></div>
          )}
        </div>

        {/* Song List */}
        {!errorMsg &&
          (loading && tempSongs.length < 10 ? (
            <SongListSkeleton rows={10} />
          ) : tempSongs.length === 0 ? (
            /* ── Empty playlist state ── */
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-white/10 flex items-center justify-center">
                <ListMusic className="w-8 h-8 text-purple-300/80" />
              </div>
              <div>
                <p className="text-white font-semibold">This playlist is empty</p>
                <p className="text-sm text-white/50 mt-1 max-w-[260px]">
                  Add songs from the home page and they&apos;ll show up here.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors shadow-md"
              >
                <Home className="w-4 h-4" />
                Browse songs
              </Link>
            </div>
          ) : (
            <SongList
              handlePlayClick={handlePlayClick}
              playing={playing}
              playingSong={playingSong}
              songs={tempSongs}
              isTemp={true}
            />
          ))}

        {loading && tempSongs.length >= 10 && (
          <p className="text-center mt-4 text-purple-200 whitespace-pre-line">
            <i className="ri-loader-2-line text-purple-300 text-6xl animate-spin inline-block" />
          </p>
        )}

        {!tempHasMoreSongs && tempSongs.length > 0 && (
          <p className="text-center mt-4 text-purple-200">
            You have reached the end of the playlist.
          </p>
        )}

        {deleting && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <i className="ri-loader-2-line text-purple-300 text-6xl animate-spin" />
          </div>
        )}
      </>
    </ProtectedLayout>
  );
};

export default PlaylistPage;
