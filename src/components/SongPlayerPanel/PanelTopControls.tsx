import React from "react";
import DeleteBtn from "./PanelButtons/DeleteBtn";
import ClosePanelBtn from "./PanelButtons/ClosePanelBtn";
import DownloadBtn from "./PanelButtons/DownloadBtn";
import ShareSongBtn from "./PanelButtons/ShareSongBtn";
import AddToFav from "./PanelButtons/AddToFav";
import SkipBtn from "./ControlButtons/SkipBtn";
interface PanelTopControlsProps {
  audioRef: AudioRef;
  downloading: boolean;
  fadeOutPanel: (panelElement: HTMLDivElement, onComplete?: () => void) => void;
  panelRef: PanelRef;
  songId: string;
  isLiked: boolean;
  showCloseBtn?: boolean;
}
const PanelTopControls: React.FC<PanelTopControlsProps> = ({
  audioRef,
  downloading,
  fadeOutPanel,
  panelRef,
  songId,
  isLiked,
  showCloseBtn = true,
}) => {
  return (
    <div className="flex w-full justify-evenly items-center mb-2 lg:mb-2 px-0 gap-1 py-2">
      <div className="p-1.5"><SkipBtn toNext={false} audioRef={audioRef} /></div>
      <div className="p-1.5"><DeleteBtn audioRef={audioRef} /></div>
      <div className="p-1.5"><ShareSongBtn /></div>
      {showCloseBtn && (
        <div className="p-1.5">
          <ClosePanelBtn
            panelRef={panelRef}
            audioRef={audioRef}
            downloading={downloading}
            fadeOutPanel={fadeOutPanel}
          />
        </div>
      )}
      <div className="p-1.5"><DownloadBtn downloading={downloading} /></div>
      <div className="p-1.5"><AddToFav songId={songId} isLiked={isLiked} audioRef={audioRef} /></div>
      <div className="p-1.5"><SkipBtn toNext audioRef={audioRef} /></div>
    </div>
  );
};

export default PanelTopControls;
