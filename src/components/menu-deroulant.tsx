"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type MenuDeroulantProps = {
  bouton: ReactNode;
  boutonClassName?: string;
  children: ReactNode;
  ariaLabel: string;
  align?: "left" | "right";
};

const STYLE_BOUTON_PAR_DEFAUT =
  "flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900";

export default function MenuDeroulant({
  bouton,
  boutonClassName,
  children,
  ariaLabel,
  align = "right",
}: MenuDeroulantProps) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fermerSiExterieur(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
        className={boutonClassName ?? STYLE_BOUTON_PAR_DEFAUT}
      >
        {bouton}
      </button>

      {ouvert && (
        <div
          className={`absolute top-12 ${
            align === "right" ? "right-0" : "left-0"
          } z-50 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg`}
          onClick={() => setOuvert(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
