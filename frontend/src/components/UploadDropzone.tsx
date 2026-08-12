'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UploadDropzone({ projectId, onUploadSuccess }: { projectId: number, onUploadSuccess: () => void }) {
  const { data: session } = useSession();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUploading) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isUploading]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'image/svg+xml'];
    const MAX_SIZE_MB = 10;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Unsupported format. Please upload JPG, PNG, BMP, or SVG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/upload/${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData
      });
      
      if (res.ok) {
        onUploadSuccess();
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors relative overflow-hidden ${
        isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {isUploading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 transition-all">
          <div className="w-12 h-12 mb-4">
            <svg className="animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Processing AI</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center max-w-xs">Removing background and optimizing colors. This usually takes 5-15 seconds...</p>
          
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden relative">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[progress_2s_ease-in-out_infinite] w-[50%] absolute left-0" style={{
              backgroundSize: '200% 100%'
            }}></div>
          </div>
          <div className="mt-3 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
            {formatTime(elapsedTime)}
          </div>
        </div>
      )}

      <div className={`space-y-1 text-center transition-opacity ${isUploading ? 'opacity-0' : 'opacity-100'}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload a file</span>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleChange} accept="image/jpeg,image/png,image/bmp,image/svg+xml" />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, BMP, SVG up to 10MB
        </p>
      </div>
    </div>
  );
}
