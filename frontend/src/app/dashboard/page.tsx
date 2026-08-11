'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UploadDropzone from '@/components/UploadDropzone';
import StitchViewer from '@/components/StitchViewer';

interface Project {
  id: number;
  name: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects/', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ name: `New Project ${projects.length + 1}` })
      });
      if (res.ok) {
        fetchProjects();
      } else {
        alert("Failed to create project. Check credits.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const digitizeProject = async (projectId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/digitize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        fetchProjects();
      } else {
        const error = await res.json();
        alert(`Digitization failed: ${error.detail}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Projects</h2>
        <button 
          onClick={createProject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          + New Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 animate-pulse">
          <p className="text-gray-500 font-medium">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map((project, index) => (
            <li 
              key={project.id} 
              className="py-4 flex flex-col justify-between transition-all duration-300 ease-in-out opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                  <p className="text-sm text-gray-500">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              {/* Show upload zone if pending */}
              {project.status === 'pending' && (
                <div className="mt-4">
                  <UploadDropzone projectId={project.id} onUploadSuccess={fetchProjects} />
                </div>
              )}

              {/* Show digitize button if processing (uploaded) */}
              {project.status === 'processing' && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => digitizeProject(project.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Generate Embroidery (Digitize)
                  </button>
                </div>
              )}

              {/* Show stitch viewer if completed */}
              {project.status === 'completed' && project.embroidery_file_url && (
                <div className="mt-4">
                  <StitchViewer fileUrl={project.embroidery_file_url} />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button className="bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded hover:bg-indigo-200">
                      Download .PES
                    </button>
                    <button className="bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded hover:bg-indigo-200">
                      Download .DST
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
