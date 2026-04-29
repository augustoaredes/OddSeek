interface OddSeekLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Full logo — shows the complete logo.png (mascot circle + "OddSeek" text below).
 * Used on the auth page header and other prominent branding moments.
 *
 * Filter shifts gold → lime-green: hue-rotate(30deg) matches the site's #CCFF00.
 */
export function OddSeekLogo({ size = 'lg', className }: OddSeekLogoProps) {
  const dim = { sm: 72, md: 96, lg: 120 }[size];

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt="OddSeek"
        width={dim}
        height={dim}
        style={{
          width: dim,
          height: dim,
          objectFit: 'contain',
          filter: 'hue-rotate(30deg) saturate(1.5) brightness(1.08)',
        }}
      />
    </span>
  );
}
