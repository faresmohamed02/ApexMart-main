interface AvatarProps {
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

export function Avatar({ initials, color = 'from-emerald-400 to-emerald-600', size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size]} ${className}`}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}
