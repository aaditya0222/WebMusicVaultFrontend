import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Song } from "../services/song.services";
import { login, signup, clearAuth } from "./auth.slice";

export type repeatType = "repeat" | "noRepeat" | "single";

// Hard cap on the Play Next queue.
export const MAX_UP_NEXT_QUEUE_SIZE = 15;

export type playNextContextType = "songs" | "tempSongs";

interface PlayerState {
  playing: boolean;
  playingSong: Song | null;
  duration: number;
  currentTime: number;
  expandedPanelOpen: boolean;
  expandedPanelTrigger: number;
  miniPanelOpen: boolean;
  repeat: repeatType;
  shuffle: boolean;
  // "Play Next" queue. TODO: persists (in-memory) with the main page's
  // playing song; resets when playback switches context (setPlayNextContext).
  upNextQueue: Song[];
  // Which context's queue is currently active: "songs" (main page) or
  // "tempSongs" (search/playlist/liked/shuffle). null = no queue yet.
  playNextContext: playNextContextType | null;
}

const initialState: PlayerState = {
  playing: false,
  playingSong: null,
  duration: 0,
  currentTime: 0,
  expandedPanelOpen: false,
  expandedPanelTrigger: 0,
  miniPanelOpen: false,
  repeat: "repeat",
  shuffle: false,
  upNextQueue: [],
  playNextContext: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.playing = action.payload;
    },
    setPlayingSong: (state, action: PayloadAction<Song | null>) => {
      state.playingSong = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setExpandedPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.expandedPanelOpen = action.payload;
    },
    setExpandedPanelTrigger: (state) => {
      state.expandedPanelTrigger += 1;
    },
    setMiniPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.miniPanelOpen = action.payload;
    },
    setRepeat: (state, action: PayloadAction<repeatType>) => {
      state.repeat = action.payload;
    },
    setShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    // "Play Next": add a song to the END of the queue so it plays in FIFO
    // order — the first song you queued is the first one that plays. No-op
    // when the queue is full, when the song is already queued (no reordering),
    // or when it's the currently playing song.
    addToPlayNext: (state, action: PayloadAction<Song>) => {
      if (state.upNextQueue.length >= MAX_UP_NEXT_QUEUE_SIZE) return;
      if (state.upNextQueue.some((s) => s._id === action.payload._id)) return;
      if (state.playingSong?._id === action.payload._id) return;
      state.upNextQueue.push(action.payload);
    },
    dequeueUpNext: (state) => {
      state.upNextQueue.shift();
    },
    removeFromUpNext: (state, action: PayloadAction<string>) => {
      state.upNextQueue = state.upNextQueue.filter((s) => s._id !== action.payload);
    },
    // Clear the Play Next queue. Keeps playNextContext unchanged so new
    // adds after clearing still go to the same page's queue.
    clearPlayNext: (state) => {
      state.upNextQueue = [];
    },
    // Mark which context the queue belongs to. If the context changes
    // (i.e. a different page's song starts playing), the queue resets and
    // belongs to the new context.
    setPlayNextContext: (state, action: PayloadAction<playNextContextType>) => {
      if (state.playNextContext !== action.payload) {
        state.upNextQueue = [];
        state.playNextContext = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    const clearPlayerState = (state: PlayerState) => {
      state.playing = false;
      state.playingSong = null;
      state.duration = 0;
      state.currentTime = 0;
      state.expandedPanelOpen = false;
      state.miniPanelOpen = false;
      state.upNextQueue = [];
      state.playNextContext = null;
    };

    builder
      .addCase(login, clearPlayerState)
      .addCase(signup, clearPlayerState)
      .addCase(clearAuth, clearPlayerState);
  },
});

export const {
  setPlaying,
  setPlayingSong,
  setDuration,
  setCurrentTime,
  setExpandedPanelOpen,
  setExpandedPanelTrigger,
  setRepeat,
  setShuffle,
  setMiniPanelOpen,
  addToPlayNext,
  dequeueUpNext,
  removeFromUpNext,
  clearPlayNext,
  setPlayNextContext,
} = playerSlice.actions;

export default playerSlice.reducer;
