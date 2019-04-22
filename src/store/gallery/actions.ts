import { action } from "typesafe-actions";
import { GalleryActionTypes, IGalleryState } from "./types";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import { IUITreeNode } from "../../api/models/file-explorer.model";

// Description: Stores the current parent folder of the selected file when displaying gallery style displays for next, prev, play, others functionalities
export const initializeGallery = (data: {selectedFile: IUITreeNode; explorer: IUITreeNode; }) => action(GalleryActionTypes.INITIALIZE_GALLERY, data);
export const initializeGallerySuccess = (gallery: IGalleryState) => action(GalleryActionTypes.INITIALIZE_GALLERY_SUCCESS, gallery);

export const setGalleryActiveItem = (galleryItem: IGalleryItem) => action(GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM, galleryItem);
export const resetGalleryActiveItem = () => action(GalleryActionTypes.RESET_GALLERY_ACTIVE_ITEM);
export const setGalleryFile = (file: IFileBlob) => action(GalleryActionTypes.SET_GALLERY_FILE, file);


export const setGalleryItems = (data: {selectedFile: IUITreeNode; explorer: IUITreeNode; }) => action(GalleryActionTypes.SET_GALLERY_ITEMS, data); // Set initial array
export const setGalleryItemsBlobs = (galleryItems: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS_BLOBS, galleryItems); // Set blobs use SET_GALLERY_ITEMS_SUCCESS
export const setGalleryItemsSuccess = (galleryItems: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS_SUCCESS, galleryItems);
export const resetGalleryItems = () => action(GalleryActionTypes.RESET_GALLERY_ITEMS);





export const destroyGallery = () => action(GalleryActionTypes.DESTROY_GALLERY);
