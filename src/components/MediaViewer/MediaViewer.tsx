import React from 'react';

interface MediaViewerProps {
  file: {
    downloadURL: string;
    type: string;
    name: string;
  };
  onClose: () => void;
  open: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ file, onClose, open }) => {
  if (!open) return null;

  const renderMedia = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.downloadURL}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <video
          controls
          className="max-w-full max-h-full"
          autoPlay={false}
        >
          <source src={file.downloadURL} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.type.startsWith('audio/')) {
      return (
        <audio controls className="w-full">
          <source src={file.downloadURL} type={file.type} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={file.downloadURL}
          className="w-full h-full"
          title={file.name}
        />
      );
    }

    if (file.type === 'text/plain') {
      return (
        <iframe
          src={file.downloadURL}
          className="w-full h-full"
          title={file.name}
        />
      );
    }

    return (
      <div className="text-center p-4">
        <p>Preview not available for this file type.</p>
        <a
          href={file.downloadURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-auto my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="h-full w-full bg-white rounded-lg overflow-hidden p-4">
          <div className="h-full w-full flex items-center justify-center">
            {renderMedia()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
