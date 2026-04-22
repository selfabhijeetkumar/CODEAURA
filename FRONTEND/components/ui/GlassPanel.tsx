import { cn } from '@/lib/utils/cn';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'plasma' | 'aurora' | 'ember' | 'none';
}

export function GlassPanel({ glow = 'none', className, children, ...props }: GlassPanelProps) {
  const glowStyles = {
    plasma: 'shadow-plasma',
    aurora: 'shadow-aurora',
    ember: 'shadow-ember',
    none: '',
  };

  return (
    <div
      className={cn(
        'glass-panel',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
