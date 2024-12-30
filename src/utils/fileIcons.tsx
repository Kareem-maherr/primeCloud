import React from 'react';
import {
  InsertDriveFile as DefaultFileIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Code as CodeIcon,
  PictureAsPdf as PdfIcon,
  Archive as ArchiveIcon,
  TableChart as SpreadsheetIcon,
  Slideshow as PresentationIcon,
} from '@mui/icons-material';

export const getFileIcon = (type: string) => {
  // Normalize the type to lowercase for comparison
  const normalizedType = type.toLowerCase();

  // Image files
  if (normalizedType.match(/^image\/(jpeg|jpg|png|gif|bmp|webp|svg|ico)$/i) ||
      normalizedType.endsWith('.jpg') || normalizedType.endsWith('.jpeg') ||
      normalizedType.endsWith('.png') || normalizedType.endsWith('.gif') ||
      normalizedType.endsWith('.bmp') || normalizedType.endsWith('.webp') ||
      normalizedType.endsWith('.svg') || normalizedType.endsWith('.ico')) {
    return <ImageIcon color="primary" />;
  }

  // Video files
  if (normalizedType.match(/^video\/(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i) ||
      normalizedType.endsWith('.mp4') || normalizedType.endsWith('.webm') ||
      normalizedType.endsWith('.ogg') || normalizedType.endsWith('.avi') ||
      normalizedType.endsWith('.mov') || normalizedType.endsWith('.wmv') ||
      normalizedType.endsWith('.flv') || normalizedType.endsWith('.mkv')) {
    return <VideoIcon color="primary" />;
  }

  // Audio files
  if (normalizedType.match(/^audio\/(mp3|wav|ogg|aac|wma|m4a)$/i) ||
      normalizedType.endsWith('.mp3') || normalizedType.endsWith('.wav') ||
      normalizedType.endsWith('.ogg') || normalizedType.endsWith('.aac') ||
      normalizedType.endsWith('.wma') || normalizedType.endsWith('.m4a')) {
    return <AudioIcon color="primary" />;
  }

  // Document files
  if (normalizedType.match(/^application\/(msword|vnd.openxmlformats-officedocument.wordprocessingml.document|rtf|txt)$/i) ||
      normalizedType.endsWith('.doc') || normalizedType.endsWith('.docx') ||
      normalizedType.endsWith('.rtf') || normalizedType.endsWith('.txt')) {
    return <DocumentIcon color="primary" />;
  }

  // PDF files
  if (normalizedType === 'application/pdf' || normalizedType.endsWith('.pdf')) {
    return <PdfIcon color="primary" />;
  }

  // Code files
  if (normalizedType.endsWith('.js') || normalizedType.endsWith('.jsx') ||
      normalizedType.endsWith('.ts') || normalizedType.endsWith('.tsx') ||
      normalizedType.endsWith('.html') || normalizedType.endsWith('.css') ||
      normalizedType.endsWith('.py') || normalizedType.endsWith('.java') ||
      normalizedType.endsWith('.cpp') || normalizedType.endsWith('.c') ||
      normalizedType.endsWith('.php') || normalizedType.endsWith('.rb') ||
      normalizedType.endsWith('.swift') || normalizedType.endsWith('.go')) {
    return <CodeIcon color="primary" />;
  }

  // Archive files
  if (normalizedType.match(/^application\/(zip|x-rar-compressed|x-7z-compressed|x-tar|x-gzip)$/i) ||
      normalizedType.endsWith('.zip') || normalizedType.endsWith('.rar') ||
      normalizedType.endsWith('.7z') || normalizedType.endsWith('.tar') ||
      normalizedType.endsWith('.gz')) {
    return <ArchiveIcon color="primary" />;
  }

  // Spreadsheet files
  if (normalizedType.match(/^application\/(vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet)$/i) ||
      normalizedType.endsWith('.xls') || normalizedType.endsWith('.xlsx') ||
      normalizedType.endsWith('.csv')) {
    return <SpreadsheetIcon color="primary" />;
  }

  // Presentation files
  if (normalizedType.match(/^application\/(vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation)$/i) ||
      normalizedType.endsWith('.ppt') || normalizedType.endsWith('.pptx')) {
    return <PresentationIcon color="primary" />;
  }

  // Default file icon for unknown types
  return <DefaultFileIcon color="primary" />;
};
