'use client';

import { useEffect, useRef } from 'react';

export default function StitchViewer({ fileUrl }: { fileUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid (simulating hoop)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Simulate drawing stitches from the file
    ctx.strokeStyle = '#4f46e5'; // Indigo stitch color
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    // Simulate a digitized design shape
    ctx.moveTo(100, 100);
    ctx.lineTo(200, 150);
    ctx.lineTo(250, 100);
    ctx.lineTo(300, 200);
    ctx.lineTo(150, 300);
    ctx.lineTo(100, 100);
    
    // Fill with tatami-like pattern
    for(let i=120; i<250; i+=10) {
      ctx.moveTo(120, i);
      ctx.lineTo(280, i);
    }
    
    ctx.stroke();

    // Add UI text overlay
    ctx.font = '12px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Interactive 2D Stitch Preview', 10, 20);
    ctx.fillText(`File: ${fileUrl.split('/').pop()}`, 10, 40);

  }, [fileUrl]);

  return (
    <div className="relative border-4 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400}
        className="w-full h-auto cursor-crosshair"
      />
      <div className="absolute bottom-2 right-2 flex space-x-2">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded shadow">
          🔍 +
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded shadow">
          🔍 -
        </button>
      </div>
    </div>
  );
}
