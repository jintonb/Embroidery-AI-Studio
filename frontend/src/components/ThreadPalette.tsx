'use client';

import React, { useState } from 'react';

interface ThreadPaletteProps {
  projectId: number;
  originalPalette: string[];
  colorMap: Record<string, string>;
  stitchData?: Array<{ hex: string; mapped_hex: string; stitch_count: number }>;
  onColorChange: (originalHex: string, newHex: string) => void;
  onRevert: () => void;
  accessToken: string;
}

export default function ThreadPalette({
  projectId,
  originalPalette,
  colorMap,
  stitchData,
  onColorChange,
  onRevert,
  accessToken
}: ThreadPaletteProps) {
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [newColor, setNewColor] = useState<string>('');

  const handleEditClick = (origHex: string) => {
    setEditingColor(origHex);
    setNewColor(colorMap[origHex] || origHex);
  };

  const handleApply = () => {
    if (editingColor && newColor) {
      onColorChange(editingColor, newColor);
    }
    setEditingColor(null);
  };

  const handleCancel = () => {
    setEditingColor(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex flex-col h-full border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Thread Colors</h3>
        <button
          onClick={onRevert}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-900/30 px-3 py-1 rounded transition-colors"
        >
          Reset All Colors
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {originalPalette.map((origHex) => {
          const currentMappedHex = colorMap[origHex] || origHex;
          const sData = stitchData?.find((s) => s.hex === origHex || s.mapped_hex === currentMappedHex);
          
          return (
            <div key={origHex} className="flex items-center justify-between p-3 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full shadow-inner border border-gray-600 flex-shrink-0" 
                  style={{ backgroundColor: currentMappedHex }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200 uppercase">{currentMappedHex}</span>
                  {sData && (
                    <span className="text-xs text-gray-400">{sData.stitch_count.toLocaleString()} stitches</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleEditClick(origHex)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Edit Color"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          );
        })}
      </div>

      {editingColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h3 className="text-lg font-medium text-white">Edit Thread Color</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex flex-col space-y-6">
              <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-2">Original</span>
                  <div className="w-12 h-12 rounded-full border-2 border-gray-600" style={{ backgroundColor: editingColor }} />
                  <span className="text-xs text-gray-300 mt-2 uppercase">{editingColor}</span>
                </div>
                <div className="text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-2">New</span>
                  <div className="w-12 h-12 rounded-full border-2 border-gray-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ backgroundColor: newColor }} />
                  <span className="text-xs text-indigo-300 mt-2 uppercase font-medium">{newColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Custom Color</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="color" 
                    value={newColor} 
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end space-x-3 bg-gray-800/30">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
              >
                Apply Color
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
