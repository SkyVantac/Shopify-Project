import type { InputHTMLAttributes } from "react";

type ChampTexteProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

// Champ de formulaire ".inp" du design system SKY VANTAC.
export default function ChampTexte({ label, id, ...props }: ChampTexteProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-brand border border-line bg-ink px-4 py-2.5 text-parchment outline-none placeholder:text-dim focus:border-accent"
        {...props}
      />
    </div>
  );
}
