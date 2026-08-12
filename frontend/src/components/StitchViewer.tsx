'use client';

export default function StitchViewer({ fileUrl }: { fileUrl: string }) {
  // fileUrl points to exports/uuid.zip. We generate a .png preview with the same UUID.
  const previewUrl = `http://localhost:8000/${fileUrl.replace('.zip', '.png').replace('\\', '/')}`;

  return (
    <div className="relative border-4 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex justify-center items-center">
      <img 
        src={previewUrl} 
        alt="Stitch Preview" 
        className="w-full max-w-xl h-auto object-contain p-4"
      />
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
        Live Preview
      </div>
    </div>
  );
}
