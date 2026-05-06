// apps/browse/src/utils/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Wiki API
export const wikiApi = {
  // 1. 获取 Wiki 目录
  getCatalog: async () => {
    const response = await api.get('/wiki/catalog');
    return response.data;
  },

  // 2. 根据 slug 获取 Wiki 文档内容
  getContent: async (slug: string) => {
    const response = await api.get(`/wiki/content/${slug}`);
    return response.data;
  },

  // 3. 获取源代码片段
  // Usage: /api/wiki/source?file=packages/compiler-core/src/tokenizer.ts&startLine=1&endLine=23
  getSource: async (filePath: string, startLine?: number, endLine?: number) => {
    const params = new URLSearchParams();
    params.append('file', filePath);
    if (startLine !== undefined) params.append('startLine', String(startLine));
    if (endLine !== undefined) params.append('endLine', String(endLine));
    const response = await api.get(`/wiki/source?${params.toString()}`);
    return response.data;
  },
};

export default api;
