import { ACRONYMS } from '../../data/acronyms';

interface AcronymProps {
  term: string;
  def?: string;
  className?: string;
}

export function Acronym({ term, def, className = '' }: AcronymProps) {
  const definition = def ?? ACRONYMS[term] ?? '';
  if (!definition) return <>{term}</>;
  return (
    <abbr
      title={definition}
      className={`no-underline border-b border-dotted border-gray-400 cursor-help ${className}`}
    >
      {term}
    </abbr>
  );
}
