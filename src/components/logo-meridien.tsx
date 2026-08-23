type LogoMeridienProps = {
  size?: number;
  className?: string;
};

// Logo "Méridien" — repris tel quel de la vitrine (www.skyvantac.com).
export default function LogoMeridien({ size = 24, className }: LogoMeridienProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="SKY VANTAC"
      className={className}
    >
      <circle cx="50" cy="50" r="34" stroke="#5B8CFF" strokeWidth="5" />
      <ellipse cx="50" cy="50" rx="14" ry="34" stroke="#5B8CFF" strokeWidth="3.6" />
      <line x1="16" y1="50" x2="84" y2="50" stroke="#5B8CFF" strokeWidth="3.6" />
      <circle cx="70" cy="32" r="5.4" fill="#5B8CFF" />
    </svg>
  );
}
