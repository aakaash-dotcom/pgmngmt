import React, { useState, useRef, useEffect } from 'react';
import { uploadImageFileToGoogleDrive, getResidentDriveFolderId, compressImageBlob } from '../lib/googleWorkspace';
import { getAccessToken, googleSignIn } from '../lib/firebase';

interface DocumentCameraCaptureProps {
  tenantName?: string;
  roomNumber?: number;
  bedNumber?: string;
  isBulkContract?: boolean;
  groupName?: string;
  docType?: string; // 'ID Proof (Aadhaar / Passport)' | 'Terms & Conditions Agreement' | string
  onUploaded?: (url: string, fileId: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

export const DocumentCameraCapture: React.FC<DocumentCameraCaptureProps> = ({
  tenantName = 'Resident',
  roomNumber,
  bedNumber,
  isBulkContract,
  groupName,
  docType = 'ID Proof (Aadhaar / Passport)',
  onUploaded,
  onClose,
  compact = false,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [targetDriveFolder, setTargetDriveFolder] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMessage(
        'Camera permission was unavailable or not supported in this iframe. Switched to device photo upload.'
      );
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const processAndCompressImage = async (rawBlobOrSource: Blob | File | string) => {
    try {
      setIsCompressing(true);
      setErrorMessage(null);
      const res = await compressImageBlob(rawBlobOrSource, 1600, 1600, 0.75);
      setCapturedImage(res.dataUrl);
      setCapturedBlob(res.compressedBlob);
      setCompressedSizeKb(res.sizeKb);
    } catch (err: any) {
      console.error('Compression error:', err);
      setErrorMessage('Failed to process image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();
    processAndCompressImage(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setCompressedSizeKb(null);
    setUploadedUrl(null);
    setUploadStatus(null);
    setTargetDriveFolder(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndCompressImage(file);
  };

  const handleUploadToDrive = async () => {
    if (!capturedBlob) return;
    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadStatus('Authenticating with Google Workspace...');

      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        throw new Error('Please sign in to Google Workspace to upload to Google Drive.');
      }

      setUploadStatus('Creating organized Drive folder hierarchy...');
      const { folderId, folderPath } = await getResidentDriveFolderId(token, {
        name: tenantName,
        roomNumber,
        bedNumber,
        isBulkContract,
        groupName,
      });
      setTargetDriveFolder(folderPath);

      setUploadStatus(`Uploading compressed photo (${compressedSizeKb || 150} KB)...`);
      const cleanDocType = docType.toLowerCase().includes('tnc') || docType.toLowerCase().includes('term') || docType.toLowerCase().includes('agree')
        ? 'Terms_And_Conditions_Agreement'
        : 'ID_Proof';
      const cleanPerson = tenantName.replace(/[^a-zA-Z0-9]/g, '_');
      const timeTag = new Date().toISOString().slice(0, 10);
      const fileName = `${cleanDocType}_${cleanPerson}_${timeTag}.jpg`;

      const uploadResult = await uploadImageFileToGoogleDrive(token, fileName, capturedBlob, folderId);
      
      setUploadStatus('Document uploaded & organized successfully!');
      if (uploadResult.webViewLink) {
        setUploadedUrl(uploadResult.webViewLink);
        if (onUploaded) {
          onUploaded(uploadResult.webViewLink, uploadResult.fileId);
        }
      }
    } catch (err: any) {
      console.error('Drive upload error:', err);
      setErrorMessage(`Upload failed: ${err.message || 'Network error'}`);
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl ${compact ? 'p-3' : 'p-4 sm:p-5'} flex flex-col gap-3 shadow-xs`}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0a332c] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
          </div>
          <div>
            <h4 className="text-[13px] font-extrabold text-slate-900 leading-tight">
              {docType}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
              Organized to: {isBulkContract && groupName ? `Groups > ${groupName} > ` : 'Individual > '}{tenantName} (Room {roomNumber || '?'}{bedNumber ? `-${bedNumber}` : ''})
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Mode Selector */}
      {!capturedImage && (
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'upload' ? 'bg-white text-[#0a332c] shadow-xs' : 'text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
            <span>Upload / Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'camera' ? 'bg-white text-[#0a332c] shadow-xs' : 'text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">videocam</span>
            <span>Live Camera</span>
          </button>
        </div>
      )}

      {/* Camera Live Viewfinder */}
      {mode === 'camera' && !capturedImage && (
        <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Guide Overlay */}
          <div className="absolute inset-3 border-2 border-white/50 border-dashed rounded-lg pointer-events-none flex flex-col justify-between p-2">
            <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-md self-start font-medium">
              Frame document clearly
            </span>
          </div>

          {/* Snap Button */}
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white hover:bg-slate-100 text-[#0a332c] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-[12px] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">camera</span>
            <span>Capture Photo</span>
          </button>
        </div>
      )}

      {/* Upload File View */}
      {mode === 'upload' && !capturedImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/70 hover:bg-emerald-50/30 transition-all gap-1.5"
        >
          <span className="material-symbols-outlined text-[28px] text-slate-400">upload_file</span>
          <div>
            <p className="text-[12px] font-bold text-slate-800">Click to pick photo from device</p>
            <p className="text-[10px] text-slate-500">Auto-compressed to ~150KB for fast Drive storage</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Compression loading indicator */}
      {isCompressing && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[12px] text-slate-600 font-bold animate-pulse">
          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
          <span>Compressing & optimizing document image...</span>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="flex flex-col gap-2.5">
          <div className="relative w-full h-[150px] bg-slate-900 rounded-xl overflow-hidden border border-slate-300">
            <img
              src={capturedImage}
              alt="Document Preview"
              className="w-full h-full object-contain"
            />
            {compressedSizeKb && (
              <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-emerald-400">check</span>
                <span>Optimized ({compressedSizeKb} KB)</span>
              </div>
            )}
          </div>

          {uploadStatus && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
              <span className="truncate">{uploadStatus}</span>
            </div>
          )}

          {targetDriveFolder && (
            <div className="p-1.5 px-2 bg-slate-100 rounded-lg text-[10px] text-slate-600 font-mono truncate">
              📁 {targetDriveFolder}
            </div>
          )}

          {uploadedUrl && (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-[11px] font-bold flex items-center justify-between hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">drive_file_move</span>
                <span>View file in Google Drive</span>
              </div>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={retakePhoto}
              disabled={isUploading}
              className="flex-1 h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition-colors"
            >
              Retake / Change
            </button>

            {!uploadedUrl ? (
              <button
                type="button"
                onClick={handleUploadToDrive}
                disabled={isUploading || isCompressing}
                className="flex-1 h-[36px] bg-[#0a332c] hover:bg-[#0f4239] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-[11px]"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>{isUploading ? 'Uploading...' : 'Save to Organized Drive'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[36px] bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-[11px]"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-rose-600 shrink-0">error</span>
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

