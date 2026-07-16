---
"@open-zread/cli": patch
---

Fix npm global installation failure caused by `workspace:*` protocol in published dependencies

**Bug Fixes:**

- **cli**: Move `@open-zread/agent-sdk` from `dependencies` to `devDependencies` to prevent `workspace:*` from being published to npm
  - The package is bundled into `dist` by tsup (`noExternal: [/.*/]`), so it is not needed as a runtime dependency
  - Previously `workspace:*` remained in the `dependencies` field of the published `package.json`, causing `npm i -g @open-zread/cli` to fail with `EUNSUPPORTEDPROTOCOL: Unsupported URL Type "workspace:"`
  - Fixes [#46](https://github.com/bb-boy680/open-zread/issues/46)
