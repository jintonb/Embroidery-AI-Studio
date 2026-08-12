'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UploadDropzone from '@/components/UploadDropzone';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  name: string;
  status: string;
  created_at: string;
  embroidery_file_url?: string;
  original_palette?: string[];
  mapped_palette?: string[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        const data: Project[] = await res.json();
        // Sort newest first
        const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setProjects(sortedData);
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
        const data = await res.json();
        router.push(`/editor/${data.id}`);
      } else {
        alert("Failed to create project. Check credits.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditor = (projectId: number) => {
    router.push(`/editor/${projectId}`);
  };

  const deleteProject = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding the row when clicking delete
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        fetchProjects();
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error(error);
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
                <div 
                  className="flex justify-between items-center w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded -mx-2"
                  onClick={() => openEditor(project.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {project.name}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditor(project.id);
                      }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      → Open Editor
                    </button>
                    <button
                      onClick={(e) => deleteProject(project.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                      title="Delete Project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
          ))}
        </ul>
      )}
    </div>
  );
}
