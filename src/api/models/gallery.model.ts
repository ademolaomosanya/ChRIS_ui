import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import { getFileExtension } from "./file-explorer.model";
import FeedFileModel from "./feed-file.model";
import keyMirror from "keymirror";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  fileName: string;
  blob?: Blob;
  blobText?: any;
  fileType?: string;
  isLoaded: boolean;
  isActive: boolean;
  index: number;
}

// Description: Add all gallery related actions in this object
export const galleryActions = keyMirror({
  play: null,
  pause: null,
  next: null,
  previous: null,
  download: null,
  fullscreen: null,
  information: null
});


export default class GalleryModel {
  _parentFolderNode?: IUITreeNode;
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[] = new Array();
  constructor(node: IUITreeNode, explorer: IUITreeNode) {
    this.galleryItem = this._buildGalleryItem(node, node, 0)
    this.galleryItems = this.buildGalleryArray(node, explorer);
  }

  buildGalleryArray(node: IUITreeNode, explorer: IUITreeNode): IGalleryItem[] {
    this._findParentNode(node, explorer);
    if (!!this._parentFolderNode && !!this._parentFolderNode.children) {
      this._parentFolderNode.children.map(
        (subnode: IUITreeNode, index: number) => {
          const newItem = this._buildGalleryItem(subnode, node, index);
          this.galleryItems.push(newItem);
        }
      );
    }
    return this.galleryItems;
  }

  setActiveGalleryItem(galleryItem: IGalleryItem){
    return FeedFileModel.getFileBlob(galleryItem.file_resource);
  }

  /// 
  // setActiveGalleryItems(data: any){
  //   console.log("setActiveGalleryItems", data, this._parentFolderNode);
  //   return this._parentFolderNode;
  // }

  // Sets the blob and returns active item
  setGalleryItemBlob(blob: Blob) {
    this.galleryItem.blob = blob;
    return this.galleryItem;
  }

  // Description: takes an explorer tree node and returns a gallery Item
  _buildGalleryItem(
    node: IUITreeNode,
    active: IUITreeNode,
    index: number
  ): IGalleryItem {
    const isActive = _.isEqual(node.file, active.file),
      fileType = getFileExtension(node.module);
    const galleryItem = {
      ...node.file,
      fileName: node.module,
      isActive,
      index,
      fileType,
      isLoaded: false
    };
  
    isActive && (this.galleryItem = galleryItem);
    return galleryItem;
  }
  // Description: Find the parent folder to the selected item
  _findParentNode(node: IUITreeNode, folderNode: IUITreeNode) {
    const fileMatch = _.find(folderNode.children, (obj: IUITreeNode) => {
      return _.isEqual(obj.file, node.file);
    });

    // Iterate through Explorer children
    if (!!fileMatch) {
      this._parentFolderNode = folderNode;
    } else if (!!folderNode.children) {
      folderNode.children.forEach((child: IUITreeNode) => {
        this._findParentNode(node, child);
      });
    }
  }

  // Load URLS *****
  _imagesTotal = 100;
  _imagesLoaded = 0;
  _imagesParsed = 0;
  _loadUrls(urls: string[]) {
    this._imagesTotal = urls.length;
    this._imagesLoaded = 0;
    this._imagesParsed = 0;

    const loadSequences = new Array();
    urls.forEach((url: string) => {
      loadSequences.push(
        this._loadUrl(url)
      );
    });
    return Promise.all(loadSequences);
  }

  _loadUrl(url: string) {
    return FeedFileModel.getFileBlob(url)
      .then((response: any) => {
        this._imagesLoaded += 1;
        return response.data;
      }).catch((error) => {
        console.error(error);
      });
  }
}
