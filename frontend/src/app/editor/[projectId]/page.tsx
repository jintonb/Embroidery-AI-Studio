'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LivePreviewCanvas from '@/components/LivePreviewCanvas';
import ThreadPalette from '@/components/ThreadPalette';
import DownloadPanel from '@/components/DownloadPanel';
import UploadDropzone from '@/components/UploadDropzone';

interface Project {
  id: number;
  name: string;
  status: string;
  original_image_url?: string;
  embroidery_file_url?: string;
  preview_png_url?: string;
  original_palette?: string[];
  mapped_palette?: string[];
  stitch_data?: Array<{hex: string; mapped_hex: string; stitch_count: number}>;
  created_at: string;
}

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [density, setDensity] = useState(50);
  const [previewTimestamp, setPreviewTimestamp] = useState(Date.now());

  useEffect(() => {
    if (session?.accessToken) {
      fetchProject();
    }
  }, [session, projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        const data: Project = await res.json();
        setProject(data);
        
        // Initialize colorMap
        if (data.original_palette) {
          const newMap: Record<string, string> = {};
          data.original_palette.forEach((color, idx) => {
            newMap[color] = (data.mapped_palette && data.mapped_palette.length === data.original_palette!.length)
              ? data.mapped_palette[idx]
              : color;
          });
          setColorMap(newMap);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = async (originalHex: string, newHex: string) => {
    const updatedMap = { ...colorMap, [originalHex]: newHex };
    setColorMap(updatedMap);
    
    // Call remap
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/remap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ color_map: updatedMap })
      });
      if (res.ok) {
        // Refresh preview png cache bust
        setPreviewTimestamp(Date.now());
      }
    } catch (error) {
      console.error("Remap failed", error);
    }
  };

  const handleRevertColors = async () => {
    if (!project?.original_palette) return;
    const defaultMap: Record<string, string> = {};
    project.original_palette.forEach(c => defaultMap[c] = c);
    setColorMap(defaultMap);
    
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/remap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ color_map: defaultMap })
      });
      if (res.ok) {
        setPreviewTimestamp(Date.now());
      }
    } catch (error) {
      console.error("Remap failed", error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/digitize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ color_map: colorMap })
      });
      if (res.ok) {
        fetchProject();
      } else {
        alert("Digitization failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-white p-8">Project not found</div>;
  }

  const getFullUrl = (path?: string) => path ? `http://localhost:8000/${path.replace(/\\\\/g, '/').replace(/\\/g, '/')}` : null;
  const originalImageUrl = getFullUrl(project.original_image_url);
  const previewPngUrl = getFullUrl(project.preview_png_url);
  const derivedPngUrl = previewPngUrl ? `${previewPngUrl}?t=${previewTimestamp}` : null;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full inline-flex mt-1 font-medium ${
              project.status === 'completed' ? 'bg-green-900/50 text-green-400' :
              project.status === 'processing' ? 'bg-blue-900/50 text-blue-400' :
              'bg-yellow-900/50 text-yellow-400'
            }`}>
              {project.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {(project.status === 'processing' || project.status === 'completed') && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                isGenerating ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
              }`}
            >
              {isGenerating ? 'Generating...' : project.status === 'completed' ? 'Regenerate Embroidery' : 'Generate Embroidery'}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-4 gap-4">
        
        {/* Left Panel: Original Image & Settings */}
        <div className="w-full lg:w-1/4 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden min-w-[250px] shrink-0">
          <div className="p-4 border-b border-gray-800 bg-gray-800/50">
            <h2 className="text-sm font-medium text-gray-300">Original Image</h2>
          </div>
          <div className="p-4 flex-1 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar">
            {project.status === 'pending' ? (
              <div className="w-full">
                <UploadDropzone projectId={project.id} onUploadSuccess={fetchProject} />
              </div>
            ) : originalImageUrl ? (
              <div className="w-full bg-gray-950 rounded-lg p-2 border border-gray-800 flex items-center justify-center min-h-[200px] mb-6">
                <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[300px] object-contain rounded" />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 mb-6">
                No image
              </div>
            )}

            {project.status !== 'pending' && (
              <div className="w-full mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Stitch Density</span>
                      <span>{density}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" max="100" 
                      value={density} 
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 italic">Adjusts how tightly packed the stitches are generated.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Live Preview */}
        <div className="w-full lg:w-2/4 flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-300">Embroidery Preview</h2>
            {isGenerating && <span className="text-xs text-indigo-400 animate-pulse">Processing...</span>}
          </div>
          <div className="flex-1 p-2 bg-[#0f1117]">
            <LivePreviewCanvas 
              previewUrl={derivedPngUrl} 
              isLoading={isGenerating} 
            />
          </div>
        </div>

        {/* Right Panel: Palette & Downloads */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-hidden min-w-[300px] shrink-0">
          
          {(project.status === 'processing' || project.status === 'completed') && project.original_palette && (
            <div className={`flex flex-col overflow-hidden ${project.status === 'completed' && project.embroidery_file_url ? 'h-1/2' : 'h-full'}`}>
              <ThreadPalette 
                projectId={project.id}
                originalPalette={project.original_palette}
                colorMap={colorMap}
                stitchData={project.stitch_data}
                onColorChange={handleColorChange}
                onRevert={handleRevertColors}
                accessToken={session?.accessToken || ''}
              />
            </div>
          )}

          {project.status === 'completed' && project.embroidery_file_url && previewPngUrl && (
            <div className="flex flex-col h-1/2">
              <DownloadPanel 
                projectId={project.id}
                zipUrl={project.embroidery_file_url}
                pngUrl={previewPngUrl}
                stitchData={project.stitch_data}
              />
            </div>
          )}

          {project.status === 'pending' && (
            <div className="h-full bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center text-center">
              <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              <h3 className="text-gray-400 font-medium mb-2">Awaiting Upload</h3>
              <p className="text-sm text-gray-500">Upload an image in the left panel to begin.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
