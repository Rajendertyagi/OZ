// apps/browse/src/components/WikiContent.tsx
import { useState } from 'react';
import { useWiki } from '../hooks/useWiki';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TableOfContents } from './TableOfContents';
import { Clock, Signal } from 'lucide-react';
import type { TocItem } from '../hooks/useTableOfContents';

export function WikiContent() {
  const { currentPage, currentContent, references } = useWiki();
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        选择一个文档开始阅读
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-8 px-8 py-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span className="text-cyan-600 hover:underline cursor-pointer">{currentPage.section}</span>
            <span>/</span>
            <span>{currentPage.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPage.title}</h1>

            {/* Meta info */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" />
                <span>6 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal size={16} className="text-amber-500" />
                <span>等级: {currentPage.level === 'Beginner' ? '入门' : currentPage.level === 'Intermediate' ? '中级' : '高级'}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <MarkdownRenderer
              content={currentContent}
              onReferencesFound={() => {}}
              onHeadingsExtracted={setTocItems}
            />

            {/* Sources section */}
            {references.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-3">来源:</h3>
                <div className="flex flex-wrap gap-2">
                  {references.map((ref, idx) => (
                    <span key={idx}>
                      <a
                        href="#"
                        className="text-cyan-600 underline hover:text-cyan-700"
                      >
                        {ref.fileName}
                      </a>
                      {idx < references.length - 1 && <span className="text-gray-400">, </span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky TOC sidebar */}
        <div className="w-16 shrink-0">
          <div className="sticky top-6">
            <TableOfContents items={tocItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
