// apps/browse/src/components/TableOfContents.tsx
import { useState, useEffect } from 'react';
import type { TocItem } from '../hooks/useTableOfContents';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  // Track scroll position to update active indicator
  useEffect(() => {
    const handleScroll = () => {
      const headings = items
        .map(item => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPos = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading && heading.offsetTop <= scrollPos) {
          setActiveId(items[i]?.id || null);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="relative flex flex-col items-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thin indicators line */}
      <div className="flex flex-col gap-2 py-2 pr-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`
              w-1 rounded-full transition-all duration-200
              ${activeId === item.id
                ? 'h-5 bg-cyan-500'
                : 'h-3 bg-gray-300 hover:bg-gray-400'
              }
            `}
            style={{
              marginRight: `${(item.level - 2) * 4}px`
            }}
            title={item.text}
          />
        ))}
      </div>

      {/* Expanded card */}
      <div
        className={`
          absolute right-6 top-0
          bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100
          transition-all duration-300 ease-out origin-right
          ${isHovered
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-95 translate-x-2 pointer-events-none'
          }
        `}
        style={{
          width: '240px',
          maxHeight: '70vh'
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            目录
          </span>
        </div>

        {/* Items */}
        <div className="overflow-auto py-2" style={{ maxHeight: 'calc(70vh - 50px)' }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`
                w-full text-left px-4 py-1.5 text-sm
                transition-colors duration-150
                hover:bg-gray-50
                ${activeId === item.id ? 'text-cyan-600 font-medium bg-cyan-50/50' : 'text-gray-600'}
              `}
              style={{
                paddingLeft: `${16 + (item.level - 2) * 12}px`
              }}
            >
              <span className="truncate block">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
