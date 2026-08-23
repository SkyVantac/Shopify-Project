import type { ButtonHTMLAttributes, ReactNode } from "react";

type BoutonPrimaireProps = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Bouton ".cta" du design system SKY VANTAC (repris de la vitrine).
export default function BoutonPrimaire({
  children,
  className,
  type = "button",
  ...props
}: BoutonPrimaireProps) {
  return (
    <button
      type={type}
      className={`rounded-brand bg-accent px-[34px] py-[15px] text-sm font-semibold text-ink transition-colors hover:bg-accent-2 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
