interface OddSeekMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export function OddSeekMark({ size = 'md', className, style }: OddSeekMarkProps) {
  const dim = { sm: 24, md: 36, lg: 50, xl: 80 }[size];

  return (
    <span
      className={className}
      aria-label="OddSeek"
      suppressHydrationWarning
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: dim,
        height: dim,
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/mark.png"
        alt=""
        aria-hidden="true"
        width={dim}
        height={dim}
        suppressHydrationWarning
        style={{ display: 'block', objectFit: 'contain', filter: 'hue-rotate(31deg) saturate(2) brightness(1.05)' }}
      />
    </span>
  );
}
