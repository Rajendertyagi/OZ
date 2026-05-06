// apps/browse/src/components/WikiLayout.tsx
import { WikiSidebar } from './WikiSidebar';
import { WikiContent } from './WikiContent';
import { CodePanel } from './CodePanel';

export function WikiLayout() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <WikiSidebar />

      {/* Center Content - scrollable */}
      <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
        <WikiContent />
      </main>

      {/* Right Panel */}
      <CodePanel />
    </div>
  );
}
