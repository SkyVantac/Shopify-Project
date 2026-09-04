import type { SelectHTMLAttributes } from "react";

type OptionChamp = {
  valeur: string;
  libelle: string;
};

type ChampSelectProps = {
  label: string;
  options: readonly OptionChamp[];
  placeholder?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

// Menu déroulant du design system SKY VANTAC, même famille que ChampTexte.
export default function ChampSelect({
  label,
  options,
  placeholder,
  id,
  ...props
}: ChampSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-brand border border-line bg-ink px-4 py-2.5 text-parchment outline-none focus:border-accent"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
