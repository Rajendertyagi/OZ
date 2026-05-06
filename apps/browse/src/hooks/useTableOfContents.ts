// apps/browse/src/hooks/useTableOfContents.ts
import { useMemo } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function useTableOfContents(content: string): TocItem[] {
  return useMemo(() => {
    const headings: TocItem[] = [];
    const lines = content.split('\n');
    const slugMap = new Map<string, number>();

    for (const line of lines) {
      // Match markdown headings: ## Heading, ### Heading
      const match = line.match(/^(#{2,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();

        // Generate slug from text (same logic as anchor links)
        let slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        // Handle duplicate slugs
        const count = slugMap.get(slug) || 0;
        if (count > 0) {
          slug = `${slug}-${count}`;
        }
        slugMap.set(slug, count + 1);

        headings.push({
          id: slug,
          text,
          level
        });
      }
    }

    return headings;
  }, [content]);
}
