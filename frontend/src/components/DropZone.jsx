import { useCallback } from 'react';
import { Upload } from 'lucide-react';

export default function DropZone({ onFile }) {
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-400 hover:border-brand-500"
    >
      <Upload className="mb-2" size={20} />
      Drag and drop logo or click to upload
      <input type="file" className="hidden" accept="image/*" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
    </label>
  );
}