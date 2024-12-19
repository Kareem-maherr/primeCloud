import { Timestamp } from 'firebase/firestore';

export interface SharedUser {
  id: string;
  email: string;
  photoURL?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
  createdAt: Timestamp;
  createdBy: string;
  sharedWith: string[];
  path: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
  createdAt: string;
  createdBy: string;
  path: string;
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
  userId: string;
  sharedWith?: string[];
}
