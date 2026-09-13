import { AppDispatch } from "@/store/store";
import {
  setSongs,
  setNextCursor,
  setSortChanged,
  setHasMoreSongs,
  setSortBy,
  setSortOrder,
  setTempHasMoreSongs,
  setTempNextCursor,
  setTempSortChanged,
  setTempSongs,
  setTempSortBy,
  setTempSortOrder,
} from "@/reduxSlices/song.slice";
import {
  setExpandedPanelOpen,
  setMiniPanelOpen,
} from "@/reduxSlices/player.slice";
const handleSort = (dispatch: AppDispatch, isTemp = false) => {
  if (isTemp) {
    dispatch(setTempSongs([]));
    dispatch(setTempNextCursor(undefined));
    dispatch(setTempSortChanged(true));
    dispatch(setTempHasMoreSongs(true));
  } else {
    dispatch(setSongs([]));
    dispatch(setNextCursor(undefined));
    dispatch(setHasMoreSongs(true));
    dispatch(setSortChanged(true));
  }

  dispatch(setExpandedPanelOpen(false));
  dispatch(setMiniPanelOpen(false));
};
const handleSortBy = (
  sortBy: sortByT,
  dispatch: AppDispatch,
  isTemp = false,
) => {
  handleSort(dispatch, isTemp);
  if (isTemp) dispatch(setTempSortBy(sortBy));
  else dispatch(setSortBy(sortBy));
};

const handleSortOrder = (
  sortOrder: sortOrderT,
  dispatch: AppDispatch,
  isTemp = false,
) => {
  handleSort(dispatch, isTemp);
  if (isTemp) dispatch(setTempSortOrder(sortOrder));
  else dispatch(setSortOrder(sortOrder));
};

export { handleSortBy, handleSortOrder };
