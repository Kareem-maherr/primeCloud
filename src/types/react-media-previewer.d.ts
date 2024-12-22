declare module 'react-media-previewer' {
  interface PreviewModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    urls: string[];
  }

  const PreviewModal: React.FC<PreviewModalProps>;
  export default PreviewModal;
} 