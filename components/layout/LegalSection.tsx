import { ReactNode } from 'react';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
        {title}
      </h2>
      <div className="text-purple-600 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 ml-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-pink-400 mt-1.5 text-xs">●</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
