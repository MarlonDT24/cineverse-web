import { useState } from 'react';
import { Film } from 'lucide-react';

export default function MoviePoster({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="aspect-[2/3] w-full bg-secondary flex items-center justify-center">
        <Film size={40} className="text-text-muted opacity-30" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="aspect-[2/3] w-full object-cover"
    />
  );
}
