import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================
// AVATAR COMPONENT - With Initials Fallback
// ============================================================

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

/**
 * Get initials from a name (first two letters of first two words)
 * Examples: "John Doe" -> "JD", "daudzubaidi" -> "DA"
 */
function getInitials(name: string): string {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words: take first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Generate a consistent color based on name
 */
function getColorFromName(name: string): string {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Coral
  ];
  
  // Use name to consistently pick a color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = 48, className }: AvatarProps) {
  const initials = getInitials(name);
  const gradient = getColorFromName(name);
  
  return (
    <div 
      className={cn("relative overflow-hidden rounded-full flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ 
            background: gradient,
            fontSize: size * 0.4,
            lineHeight: 1
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
