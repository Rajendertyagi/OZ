/**
 * useWikiSync — Wiki 同步 Hook
 *
 * 流程：检测 → 规划（LLM） → 执行（归档 + 并发生成 .md）
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { useWiki } from '../../../provider';
import { WikiStore, loadConfig } from '@open-zread/utils';
import { syncWiki, generateWikiContent, type CatalogEvent, type ArticleEventPayload } from '@open-zread/orchestrator';
import { syncCatalogEventToState, syncArticleEventToState } from '../mapper';
import type { SyncCatalogEventPayload } from '../mapper';
import { createInitialSyncState } from '../state';
import type { WikiSyncState, SyncArticlesState } from '../types';

interface UseWikiSyncReturn {
  state: WikiSyncState;
  /** 同步是否全部完成 */
  allCompleted: boolean;
}

export function useWikiSync(): UseWikiSyncReturn {
  const { reload } = useWiki();

  const [state, updateState] = useImmer<WikiSyncState>(() => createInitialSyncState([]));
  const [allCompleted, setAllCompleted] = useState(false);
  const isRunning = useRef(false);

  /** Agent 目录事件回调 */
  const handleCatalogEvent = useCallback(
    (rawEvent: CatalogEvent) => {
      const event: SyncCatalogEventPayload = {
        type: rawEvent.type,
        toolName: rawEvent.toolName,
        usage: rawEvent.usage,
        error: rawEvent.error,
        durationMs: rawEvent.durationMs,
        retryCount: rawEvent.retryCount,
        maxRetries: rawEvent.maxRetries,
        delayMs: rawEvent.delayMs,
      };
      updateState((draft) => {
        const newState = syncCatalogEventToState(
          { ...draft.catalog },
          event
        );
        Object.assign(draft.catalog, newState);
      });
    },
    [updateState]
  );

  /** 文章事件回调 */
  const handleArticleEvent = useCallback(
    (event: ArticleEventPayload) => {
      updateState((draft) => {
        const newState = syncArticleEventToState(
          { ...draft.articles } as SyncArticlesState,
          event
        );
        Object.assign(draft.articles, newState);
      });
    },
    [updateState]
  );

  /** 自动触发同步 */
  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    (async () => {
      try {
        // 阶段1-2: syncWiki
        const result = await syncWiki(handleCatalogEvent);

        // 设置 syncPages
        const allPages = [
          ...result.diff.newPages,
          ...result.diff.updatedPages,
          ...result.diff.archivedPages,
        ];

        updateState((draft) => {
          draft.syncPages = allPages;
          const articlesState = createInitialSyncState(allPages).articles;
          Object.assign(draft.articles, articlesState);
        });

        // 阶段3: 执行
        // 3a: 归档
        const store = new WikiStore();
        for (const page of result.diff.archivedPages) {
          await store.archivePage(page);
        }

        // 3b: 创建快照
        await store.createSnapshot();

        // 3c: 重载 wiki.json（syncWiki 已写入新 wiki.json）
        await reload();

        // 3d: 并发生成 new + updated 的 .md
        if (result.diff.newPages.length > 0 || result.diff.updatedPages.length > 0) {
          let concurrent = 1;
          try {
            const config = await loadConfig();
            concurrent = config.concurrency.max_concurrent;
          } catch { /* use default */ }

          await generateWikiContent({
            pages: [...result.diff.newPages, ...result.diff.updatedPages],
            maxConcurrent: concurrent,
            onEvent: handleArticleEvent,
          });
        }

        // 标记归档页面为完成（无需生成 .md）
        updateState((draft) => {
          for (const page of result.diff.archivedPages) {
            if (draft.articles.pages[page.slug]) {
              draft.articles.pages[page.slug].status = 'completed';
              draft.articles.completedCount++;
              draft.articles.pendingCount = Math.max(0, draft.articles.pendingCount - 1);
            }
          }
        });

        setAllCompleted(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        updateState((draft) => {
          draft.catalog.status = 'failed';
          draft.catalog.error = message;
        });
      }
    })();
  }, []);

  return { state, allCompleted };
}
