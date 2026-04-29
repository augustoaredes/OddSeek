interface OddSeekMascotProps {
  /**
   * Visual size — controls rendered width. Height scales with the PNG aspect ratio.
   * casaco.png is roughly portrait (taller than wide).
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const WIDTHS = { sm: 80, md: 120, lg: 180, xl: 240 };

/**
 * Full-body mascot illustration — used in community sections, empty states,
 * onboarding headers, and celebration toasts.
 *
 * Filter shifts gold (#FFB800) → lime-green (#CCFF00) to match site palette.
 */
export function OddSeekMascot({
  size = 'md',
  className,
  style,
  alt = 'OddSeek mascote',
}: OddSeekMascotProps) {
  const w = WIDTHS[size];

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/brand/mascote/casaco.png"
      alt={alt}
      width={w}
      className={className}
      style={{
        width: w,
        height: 'auto',
        filter: 'hue-rotate(30deg) saturate(1.5) brightness(1.08)',
        ...style,
      }}
    />
  );
}
