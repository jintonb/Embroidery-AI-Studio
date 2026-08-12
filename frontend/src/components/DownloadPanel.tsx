'use client';

import React from 'react';

interface DownloadPanelProps {
  projectId: number;
  zipUrl: string;
  pngUrl: string;
  stitchData?: Array<{ hex: string; mapped_hex: string; stitch_count: number }>;
}

export default function DownloadPanel({ projectId, zipUrl, pngUrl, stitchData }: DownloadPanelProps) {
  
  const getFullUrl = (path: string) => {
    return `http://localhost:8000/${path.replace(/\\\\/g, '/').replace(/\\/g, '/')}`;
  };

  const jefUrl = zipUrl.replace('.zip', '.jef');
  const pesUrl = zipUrl.replace('.zip', '.pes');

  const downloadThreadSheet = () => {
    let content = `<html><head><title>Thread Sheet - Project ${projectId}</title><style>
      body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background-color: #f4f4f4; }
      .swatch { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #333; display: inline-block; vertical-align: middle; }
    </style></head><body>`;
    
    content += `<h1>Thread Information - Project ${projectId}</h1>`;
    content += `<table><thead><tr><th>Color</th><th>Hex</th><th>Stitches</th></tr></thead><tbody>`;
    
    if (stitchData) {
      stitchData.forEach(st => {
        content += `<tr>
          <td><div class="swatch" style="background-color: ${st.mapped_hex}"></div></td>
          <td>${st.mapped_hex}</td>
          <td>${st.stitch_count.toLocaleString()}</td>
        </tr>`;
      });
    } else {
      content += `<tr><td colspan="3">No stitch data available.</td></tr>`;
    }
    
    content += `</tbody></table></body></html>`;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}-thread-sheet.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex flex-col h-full border border-gray-800">
      <h3 className="text-lg font-medium text-white mb-4">Downloads</h3>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        <a 
          href={getFullUrl(jefUrl)} 
          download 
          className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 hover:border-indigo-500 transition-all group"
        >
          <svg className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span className="font-medium text-white">JEF File</span>
          <span className="text-xs text-gray-400 mt-1">Janome</span>
        </a>
        
        <a 
          href={getFullUrl(pesUrl)} 
          download 
          className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 hover:border-indigo-500 transition-all group"
        >
          <svg className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="font-medium text-white">PES File</span>
          <span className="text-xs text-gray-400 mt-1">Brother</span>
        </a>
        
        <a 
          href={getFullUrl(pngUrl)} 
          download 
          className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 hover:border-indigo-500 transition-all group"
        >
          <svg className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="font-medium text-white">Preview</span>
          <span className="text-xs text-gray-400 mt-1">PNG Image</span>
        </a>
        
        <button 
          onClick={downloadThreadSheet}
          className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 hover:border-indigo-500 transition-all group w-full"
        >
          <svg className="w-8 h-8 text-pink-400 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="font-medium text-white">Colors</span>
          <span className="text-xs text-gray-400 mt-1">Thread Sheet</span>
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <a 
          href={getFullUrl(zipUrl)} 
          download 
          className="flex items-center justify-center w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download All Files (.ZIP)
        </a>
      </div>
    </div>
  );
}
