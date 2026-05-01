import { defineConfig } from 'tsup'
import { cp } from 'fs/promises'
import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join, resolve } from 'path'

// Mock react-devtools-core (ink 的可选开发依赖，生产环境不需要)
const reactDevToolsMock = {
  name: 'react-devtools-mock',
  setup(build: unknown) {
    const b = build as {
      onResolve: (args: { filter: RegExp }, handler: () => { path: string; namespace: string }) => void
      onLoad: (args: { filter: RegExp; namespace: string }, handler: () => { contents: string; loader: string }) => void
    }
    b.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: 'react-devtools-core',
      namespace: 'mock',
    }))
    b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({
      contents: 'export default { connectToDevTools: () => {} }',
      loader: 'js',
    }))
  },
}

function findFileRecursively(dir: string, target: string): string | null {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isFile() && entry === target) return fullPath
        if (stat.isDirectory()) {
          const found = findFileRecursively(fullPath, target)
          if (found) return found
        }
      } catch { /* skip */ continue }
    }
  } catch { /* skip */ }
  return null
}

export default defineConfig(() => {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string }

  return {
    entry: ['src/index.tsx'],
    format: ['esm'],
    splitting: false,
    sourcemap: false,
    minify: true,
    clean: true,
    bundle: true,
    noExternal: [/.*/],
    platform: 'node',
    esbuildPlugins: [reactDevToolsMock],
    define: {
      // 替换 globalThis.CLI_VERSION 为版本号常量
      'globalThis.CLI_VERSION': JSON.stringify(pkg.version),
    },
    banner: {
      js: '#!/usr/bin/env node\nimport{createRequire as __createRequire}from"module";import{fileURLToPath as __fileURLToPath}from"url";import{dirname as __dirnameFn}from"path";const require=__createRequire(import.meta.url);const __filename=__fileURLToPath(import.meta.url);const __dirname=__dirnameFn(__filename);',
    },
    onSuccess: async () => {
      const cwd = process.cwd()
      const nmPath = resolve(cwd, '../../node_modules')
      const copyWasm = async (name: string) => {
        const found = findFileRecursively(nmPath, name)
        if (found && existsSync(found)) {
          await cp(found, join(cwd, `dist/${name}`))
        }
      }
      await Promise.all([
        copyWasm('yoga.wasm'),
        copyWasm('tree-sitter.wasm'),
        copyWasm('mappings.wasm'),
      ])
    },
  }
})
