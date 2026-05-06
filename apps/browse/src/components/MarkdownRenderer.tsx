// apps/browse/src/components/MarkdownRenderer.tsx
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import type { CodeReference } from '../types/wiki';
import { useTableOfContents } from '../hooks/useTableOfContents';

interface MarkdownRendererProps {
  content: string;
  onReferencesFound: (refs: CodeReference[]) => void;
  onHeadingsExtracted?: (headings: { id: string; text: string; level: number }[]) => void;
}

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function MarkdownRenderer({ content, onHeadingsExtracted }: MarkdownRendererProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const headings = useTableOfContents(content);

  // Notify parent of headings for ToC
  useEffect(() => {
    if (onHeadingsExtracted && headings.length > 0) {
      onHeadingsExtracted(headings);
    }
  }, [headings, onHeadingsExtracted]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });

    // Render mermaid diagrams
    if (mermaidRef.current) {
      mermaid.run({
        nodes: mermaidRef.current.querySelectorAll('.mermaid')
      });
    }
  }, [content]);

  return (
    <div ref={mermaidRef} className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');

            // Mermaid diagrams
            if (language === 'mermaid') {
              return (
                <div className="my-6 p-4 bg-[#faf9f7] rounded-lg border border-gray-200">
                  <div className="mermaid text-center">{codeContent}</div>
                </div>
              );
            }

            if (!inline && language) {
              return (
                <div className="my-6 rounded-lg overflow-hidden bg-[#1e1e2e]">
                  <div className="px-4 py-2 bg-[#2d2d3d] border-b border-gray-700">
                    <span className="text-xs text-gray-500 uppercase">{language}</span>
                  </div>
                  <div className="p-4 overflow-auto">
                    <SyntaxHighlighter
                      language={language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}
                      showLineNumbers
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }

            // Inline code
            return (
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-pink-600" {...props}>
                {children}
              </code>
            );
          },

          // Headings with IDs for anchor links
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => {
            const text = String(children);
            const id = generateSlug(text);
            return (
              <h2 id={id} className="text-2xl font-semibold text-gray-900 mt-8 mb-4 scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = generateSlug(text);
            return (
              <h3 id={id} className="text-xl font-semibold text-gray-900 mt-6 mb-3 scroll-mt-20">
                {children}
              </h3>
            );
          },

          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-cyan-600 underline hover:text-cyan-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full rounded-lg my-4 border border-gray-200"
            />
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
              {children}
            </td>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
