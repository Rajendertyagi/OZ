// apps/browse/src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router';
import { WikiProvider } from './context/WikiContext';
import { useWiki } from './hooks/useWiki';
import { WikiLayout } from './components/WikiLayout';
import './index.css';
import type { WikiPage as WikiPageType } from './types/wiki';

// Wiki page component that handles slug from URL
function WikiPage() {
  const { slug } = useParams<{ slug: string }>();
  const { wikiData, currentPage, selectPage } = useWiki();

  // When slug changes, find and select the corresponding page
  useEffect(() => {
    if (slug && wikiData && (!currentPage || currentPage.slug !== slug)) {
      const page = wikiData.pages.find((p: WikiPageType) => p.slug === slug);
      if (page) {
        selectPage(page);
      }
    }
  }, [slug, wikiData, currentPage, selectPage]);

  return <WikiLayout />;
}

// Home component - redirects to first page
function WikiHome() {
  const { wikiData } = useWiki();
  const navigate = useNavigate();

  useEffect(() => {
    if (wikiData && wikiData.pages.length > 0) {
      navigate(`/${wikiData.pages[0].slug}`, { replace: true });
    }
  }, [wikiData, navigate]);

  return <WikiLayout />;
}

// Main app with routing
function WikiApp() {
  const { loadWikiData } = useWiki();

  useEffect(() => {
    loadWikiData();
  }, [loadWikiData]);

  return (
    <Routes>
      <Route path="/" element={<WikiHome />} />
      <Route path="/:slug" element={<WikiPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <WikiProvider>
        <WikiApp />
      </WikiProvider>
    </BrowserRouter>
  );
}

export default App;
