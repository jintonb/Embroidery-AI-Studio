'use client';

import React, { useState, useRef, useEffect, MouseEvent, WheelEvent } from 'react';

interface LivePreviewCanvasProps {
  previewUrl: string | null;
  isLoading?: boolean;
}

export default function LivePreviewCanvas({ previewUrl, isLoading = false }: LivePreviewCanvasProps) {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.1));
  const handleFit = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=' || e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key.toLowerCase() === 'f') {
        handleFit();
      } else if (e.key === 'ArrowUp') {
        setPan(p => ({ ...p, y: p.y + 50 }));
      } else if (e.key === 'ArrowDown') {
        setPan(p => ({ ...p, y: p.y - 50 }));
      } else if (e.key === 'ArrowLeft') {
        setPan(p => ({ ...p, x: p.x + 50 }));
      } else if (e.key === 'ArrowRight') {
        setPan(p => ({ ...p, x: p.x - 50 }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full h-full bg-[#0f1117] overflow-hidden flex items-center justify-center rounded-lg"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-gray-800/80 p-2 rounded-lg backdrop-blur shadow-lg">
        <button onClick={handleZoomIn} className="text-white p-2 hover:bg-gray-700 rounded transition-colors" title="Zoom In (+)">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
        <button onClick={handleZoomOut} className="text-white p-2 hover:bg-gray-700 rounded transition-colors" title="Zoom Out (-)">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <button onClick={handleFit} className="text-white p-2 hover:bg-gray-700 rounded transition-colors" title="Fit (F)">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
        <div className="text-xs text-gray-300 text-center mt-2 border-t border-gray-600 pt-1">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas Area */}
      {!previewUrl && !isLoading && (
        <div className="flex flex-col items-center text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 15.536c-1.171 1.952-3.07 1.033-4.242 0-1.172-1.033-1.172-2.71 0-3.882s2.71-1.172 3.882 0c1.172 1.033 1.172 2.71 0 3.882z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p>No preview available</p>
        </div>
      )}

      {previewUrl && (
        <div
          className="transition-transform duration-100 ease-out origin-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <img src={previewUrl} alt="Embroidery Preview" className="max-w-none shadow-2xl pointer-events-none" />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0f1117]/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center transition-all">
          <svg className="animate-spin text-indigo-500 w-12 h-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white font-medium">Generating Preview...</p>
        </div>
      )}
    </div>
  );
}
