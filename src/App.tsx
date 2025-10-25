import React, { useState, useRef, useCallback, DragEvent } from 'react';
import { ExtractedFrame } from './types';

// --- Constants ---
const NUM_FRAMES_TO_EXTRACT = 6;
const EXTRACTION_INTERVAL_SECONDS = 0.25;

// --- Icon Components ---
const FilmIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 17l-4 4 4-4 2.293 2.293a1 1 0 010 1.414L8 23" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// --- UI Components ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, ...props }) => {
  const baseClasses = "px-4 py-2 text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ocean-darkest transition-all duration-200 ease-in-out inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-ocean text-white hover:bg-ocean-light hover:text-ocean-darkest focus:ring-ocean-light",
    secondary: "bg-ocean-darker/80 text-ocean-lightest hover:bg-ocean-darker focus:ring-ocean"
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {icon}
      {children}
    </button>
  );
};

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-light"></div>
);

// --- App Component ---
export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanup = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  }, [videoUrl]);

  const resetState = useCallback(() => {
    cleanup();
    setVideoFile(null);
    setVideoUrl(null);
    setExtractedFrames([]);
    setIsExtracting(false);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [cleanup]);

  const handleFileChange = (file: File | null) => {
    if (isExtracting) return;
    resetState();
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
      setError(null);
    } else if (file) {
      setError('無効なファイル形式です。動画ファイルを選択してください。');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (isExtracting) return;
    const file = event.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const captureFrameAtTime = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement, time: number, format: 'jpeg' | 'png'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        try {
          const context = canvas.getContext('2d');
          if (!context) {
            return reject(new Error('Canvasコンテキストを取得できませんでした。'));
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpeg' ? 0.9 : undefined;
          resolve(canvas.toDataURL(mimeType, quality));
        } catch (e) {
          reject(e);
        }
      };
      const onError = (e: Event) => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        reject(new Error(`動画のシーク中にエラーが発生しました: ${e}`));
      };
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
      video.currentTime = time;
    });
  }, []);

  const handleExtractFrames = async () => {
    if (!videoRef.current || !canvasRef.current || !videoUrl) return;
    setIsExtracting(true);
    setExtractedFrames([]);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure metadata is loaded
    if(video.readyState < 1) {
       await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, {once: true}));
    }

    const duration = video.duration;
    if (isNaN(duration)) {
      setError('動画の長さを取得できませんでした。');
      setIsExtracting(false);
      return;
    }

    const timestamps: number[] = [];
    for (let i = 0; i < NUM_FRAMES_TO_EXTRACT; i++) {
      const time = duration - i * EXTRACTION_INTERVAL_SECONDS;
      if (time >= 0) {
        timestamps.unshift(time); // Add to the beginning to keep chronological order
      }
    }
    // Make sure last frame is exactly at the end
    if (timestamps.length > 0 && !timestamps.includes(duration)) {
        timestamps[timestamps.length-1] = duration;
    }


    try {
      const frames: ExtractedFrame[] = [];
      for (const time of timestamps) {
        const dataUrl = await captureFrameAtTime(video, canvas, time, imageFormat);
        frames.push({ id: `frame-${time}`, dataUrl });
      }
      setExtractedFrames(frames);
    } catch (e: any) {
      setError(`フレームの抽出に失敗しました: ${e.message}`);
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const frameNumber = extractedFrames.length - 1 - index;
    const frameLabelForFile = frameNumber === 0 ? 'final' : `final-${frameNumber}`;
    const extension = imageFormat === 'jpeg' ? 'jpg' : 'png';

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${videoFile?.name.replace(/\.[^/.]+$/, "") || 'frame'}_${frameLabelForFile}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-transparent text-ocean-lightest font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <FilmIcon className="h-10 w-10 text-ocean-light" />
            <h1 className="text-4xl font-bold tracking-tight text-ocean-lightest drop-shadow-lg">
              動画フレーム抽出ツール
            </h1>
          </div>
          <p className="mt-2 text-lg text-ocean-lightest drop-shadow-md">
            動画の最後の瞬間を美しい画像としてキャプチャします。
          </p>
        </header>

        <main className="space-y-8">
          {/* Uploader */}
          {!videoFile && (
            <div className="bg-ocean-darker/90 backdrop-blur-sm rounded-lg p-6 border-2 border-dashed border-ocean hover:border-ocean-light transition-colors duration-300 shadow-xl">
              <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-8 rounded-md cursor-pointer ${isDragging ? 'bg-ocean-darkest/50' : ''}`}
              >
                  <UploadIcon className="h-12 w-12 text-ocean-light mb-4" />
                  <p className="text-lg font-semibold text-ocean-lightest">
                    ここに動画をドラッグ＆ドロップ
                  </p>
                  <p className="text-ocean-light">またはクリックしてファイルを選択</p>
                  <input
                      type="file"
                      accept="video/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                  />
              </div>
            </div>
          )}

          {error && <div className="bg-red-900/50 text-red-300 border border-red-700 rounded-md p-4 text-center">{error}</div>}

          {/* Video Player and Controls */}
          {videoUrl && (
            <div className="bg-ocean-darker/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 text-ocean-lightest">ビデオプレビュー</h2>
              <div className="aspect-video w-full mb-4 bg-black rounded-md overflow-hidden">
                <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label htmlFor="image-format" className="text-sm font-medium text-ocean-lightest">保存形式:</label>
                  <select
                    id="image-format"
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value as 'jpeg' | 'png')}
                    disabled={isExtracting}
                    className="bg-ocean-darkest border border-ocean text-ocean-lightest text-sm rounded-md focus:ring-ocean-light focus:border-ocean-light block w-auto p-2 cursor-pointer"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <Button onClick={handleExtractFrames} disabled={isExtracting} icon={<SparklesIcon className="h-5 w-5"/>}>
                  {isExtracting ? 'フレームを抽出中...' : '最後のフレームを抽出'}
                </Button>
                <Button onClick={resetState} variant="secondary" disabled={isExtracting}>
                  別の動画をアップロード
                </Button>
              </div>
            </div>
          )}

          {/* Extracted Frames */}
          {isExtracting && (
             <div className="flex flex-col items-center justify-center gap-4 p-8">
               <Spinner />
               <p className="text-ocean-light">フレームを抽出しています。しばらくお待ちください...</p>
             </div>
          )}

          {extractedFrames.length > 0 && (
            <div className="bg-ocean-darker/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 text-ocean-lightest">抽出されたフレーム</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {extractedFrames.map((frame, index) => {
                    const frameNumber = extractedFrames.length - 1 - index;
                    const frameLabel = frameNumber === 0 ? '最終' : `最終-${frameNumber}`;
                    const isFinalFrame = frameNumber === 0;

                    return (
                      <div
                        key={frame.id}
                        className={`group relative aspect-video rounded-md overflow-hidden shadow-md transition-all duration-300 ${
                          isFinalFrame
                            ? 'border-2 border-red-500 shadow-lg shadow-red-500/60'
                            : 'border-2 border-transparent'
                        }`}
                      >
                        <img src={frame.dataUrl} alt={`Frame ${frameLabel}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {frameLabel}
                        </span>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                           <Button
                             onClick={() => handleDownload(frame.dataUrl, index)}
                             className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300"
                             icon={<DownloadIcon className="h-4 w-4"/>}
                           >
                             保存
                           </Button>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-ocean-light text-sm drop-shadow-md">
          <p>&copy; {new Date().getFullYear()} Video Frame Extractor. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
