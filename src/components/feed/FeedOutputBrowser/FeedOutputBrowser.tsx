import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  Grid,
  GridItem,
  Spinner,  
} from "@patternfly/react-core";
import {
  FolderOpenIcon,
  FolderCloseIcon,
} from "@patternfly/react-icons";
import { getPluginName} from "./utils";
import {
  setSelectedFile,
  toggleViewerMode,
} from "../../../store/explorer/actions";
import { IUITreeNode } from "../../../api/models/file-explorer.model";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { ApplicationState } from "../../../store/root/applicationState";
import FileBrowser from "./FileBrowser";
import PluginViewerModal from "./PluginViewerModal";
import {
  getPluginFilesRequest,
} from "../../../store/feed/actions";
import { FeedOutputBrowserProps } from "./types";
import { createTreeFromFiles } from "./utils";
import "./FeedOutputBrowser.scss";


const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  plugins,
  pluginInstanceResource,
  selected,
  handlePluginSelect,
  setSelectedFile,
  viewerMode,
  toggleViewerMode,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);


  const pluginName = selected && getPluginName(selected);
  const selectedFiles =
    pluginInstanceResource && selected && pluginInstanceResource[selected.data.id] && pluginInstanceResource[selected.data.id as number].files;
  const tree = selected && createTreeFromFiles(selected, selectedFiles);

  const generateSideItem = (plugin: PluginInstance): React.ReactNode => {
    const { id } = plugin.data;
    const name = getPluginName(plugin);
    const isSelected = selected && selected.data && selected.data.id === id;
    const icon = isSelected ? <FolderOpenIcon /> : <FolderCloseIcon />;
    const className = isSelected ? "selected" : undefined;

    const handleSidebarItemClick = (plugin: PluginInstance) => {
      handlePluginSelect(plugin);
    };

    return (
      <li
        className={className}
        key={id}
        onClick={() => handleSidebarItemClick(plugin)}
      >
        {icon}
        {name}
      </li>
    );
  };

  const downloadAllClick = async () => {
    if (!selected) return;
    const files = pluginInstanceResource && pluginInstanceResource[selected.data.id as number].files;

    const zip = new JSZip();
    if (files) {
      for (const file of files) {
        const fileBlob = await file.getFileBlob();
        zip.file(file.data.fname, fileBlob);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const filename = `${getPluginName(selected)}.zip`;
    FileViewerModel.downloadFile(blob, filename);
  };

  const handleFileBrowserOpen = (file: IUITreeNode, folder: IUITreeNode) => {
    setPluginModalOpen(true);
    setSelectedFile(file, folder);
  };

  const handleFileViewerOpen = (file: IUITreeNode, folder: IUITreeNode) => {
    setPluginModalOpen(true);
    setSelectedFile(file, folder);
    toggleViewerMode(!viewerMode);
  };

  const handlePluginModalClose = () => {
    setPluginModalOpen(!pluginModalOpen);
  };

  return (
    <>
      <Grid hasGutter className="feed-output-browser">
        <GridItem
          className="feed-output-browser__sidebar"
          rowSpan={12}
          span={2}
        >
          <ul className="sidebar">
            {plugins ? (
              plugins
                .sort((a: PluginInstance, b: PluginInstance) => {
                  return a.data.id - b.data.id;
                })
                .map(generateSideItem)
            ) : (
              <Spinner size="md" />
            )}
          </ul>
        </GridItem>

        <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
          <Grid>
            <GridItem span={12} rowSpan={10}>
              {selected &&
              selected.data.status === "finishedSuccessfully" &&
              tree ? (
                <FileBrowser
                  selectedFiles={selectedFiles}
                  pluginName={pluginName}
                  root={tree}
                  key={selected.data.id}
                  handleFileBrowserToggle={handleFileBrowserOpen}
                  handleFileViewerToggle={handleFileViewerOpen}
                  downloadAllClick={downloadAllClick}
                />
              ) : selected?.data.status === "finishedSuccessfully" && !tree ? (
                <GridItem span={12} rowSpan={12}>
                  <div>
                    <Spinner size="md" />
                  </div>
                </GridItem>
              ) : (
                <div>{`${pluginInstanceResource}`}</div>
              )}
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
      <PluginViewerModal
        isModalOpen={pluginModalOpen}
        handleModalToggle={handlePluginModalClose}
      />
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource:state.feed.pluginInstanceResource,
  viewerMode: state.explorer.viewerMode,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesRequest: (selected: PluginInstance) =>
    dispatch(getPluginFilesRequest(selected)),
  setSelectedFile: (file: IUITreeNode, folder: IUITreeNode) =>
    dispatch(setSelectedFile(file, folder)),
  toggleViewerMode: (isViewerOpened: boolean) =>
    dispatch(toggleViewerMode(isViewerOpened)),
  
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedOutputBrowser);
