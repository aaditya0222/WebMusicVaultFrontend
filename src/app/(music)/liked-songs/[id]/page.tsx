"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { usePlaySong } from "@/hooks/usePlaySong";
import {
  setTempSongs,
  replaceTempSongs,
  setTempHasMoreSongs,
  setTempNextCursor,
  setSongsType,
} from "@/reduxSlices/song.slice";
import { setExpandedPanelOpen } from "@/reduxSlices/player.slice";
import { setLoading } from "@/reduxSlices/ui.slice";
import SongList from "@/components/SongList/SongList";
import SongListSkeleton from "@/components/SongList/SongListSkeleton";
import { getLikedSongs, PlaylistWithSongs } from "@/services/playlist.services";
import { Song } from "@/services/song.services";
import { ArrowLeft, Heart, Home } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/hooks/useToast";

const LikedSongsPage = () => {
  const params = useParams();
  const userId = params?.id as string;
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
  const { handlePlayClick } = usePlaySong();

  // Clear state on unmount or userId change
  useEffect(() => {
    dispatch(setSongsType("tempSongs"));
    return () => {
      dispatch(replaceTempSongs([]));
      dispatch(setTempHasMoreSongs(true));
      dispatch(setTempNextCursor(undefined));
      dispatch(setExpandedPanelOpen(false));
      dispatch(setLoading(false));
    };
  }, [dispatch, userId]);

  // Initial fetch
  useEffect(() => {
    if (!userId || shouldFetchUser) return;
    const fetchInitialSongs = async () => {
      try {
        dispatch(setLoading(true));
        setErrorMsg(null);
        const data = await getLikedSongs(userId);
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
          description: data.description,
          isDefault: data.isDefault,
        });
        document.title = `${data.name} | WmV`;
      } catch (error) {
        console.error("Error fetching liked songs:", error);
        setErrorMsg(
          "Couldn't load your liked songs. Please check your connection and try again.",
        );
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchInitialSongs();
  }, [dispatch, userId, shouldFetchUser, retryTick]);

  // Infinite Scroll fetch
  useEffect(() => {
    if (!userId || !tempNextCursor || !tempHasMoreSongs || loading) {
      return;
    }
    const fetchMoreSongs = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getLikedSongs(userId, {
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
        console.error("Error fetching more songs:", error);
        showToast({
          message: "Couldn't load more songs. Please try again.",
          type: "error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchMoreSongs();
  }, [tempTriggerFetch, userId, dispatch]);

  return (
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
            <h1 className="text-xl sm:text-3xl font-bold break-words leading-tight">{playlistInfo.name}</h1>
            {playlistInfo.description && (
              <p className="text-gray-300 text-sm sm:text-base mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2">{playlistInfo.description}</p>
            )}
          </>
        ) : errorMsg ? (
          <div className="py-2">
            <p className="text-red-300 text-sm">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setRetryTick((t) => t + 1)}
              className="mt-3 px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
            >
              Retry
            </button>
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
          /* ── Empty favourites state ── */
          <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-white/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-300/80" />
            </div>
            <div>
              <p className="text-white font-semibold">No favourites yet</p>
              <p className="text-sm text-white/50 mt-1 max-w-[260px]">
                Tap the ♥ on any song and it&apos;ll be waiting for you here.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors shadow-md"
            >
              <Home className="w-4 h-4" />
              Explore songs
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

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <i className="ri-loader-2-line text-purple-300 text-6xl animate-spin" />
        </div>
      )}
    </>
  );
};

export default LikedSongsPage;
