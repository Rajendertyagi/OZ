---
"@open-zread/cli": patch
---

Fix mermaid label validation in generated wiki pages

**Bug Fixes:**

- **orchestrator**: Validate generated Mermaid flowchart labels before writing Wiki pages
  - Add Mermaid syntax validation to the `write_page` tool that rejects flowchart node labels containing structural characters (`()`, `{}`, `|`, `<>`) without quotes
  - Return `is_error` on invalid Mermaid so the Page Agent can revise and retry instead of silently saving broken Markdown
  - Add prompt guidance requiring quoted labels (`A["节点文本"]`) and syntax self-check, especially for labels like `O(n) 说明`
  - Fixes [#43](https://github.com/bb-boy680/open-zread/pull/43)
