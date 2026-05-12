# Contributing to Open Zread

Thank you for your interest in Open Zread! We welcome all forms of contributions, including but not limited to bug reports, feature requests, documentation improvements, and code submissions.

Please take a few minutes to read this guide to ensure your contributions can be accepted smoothly.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Report a Bug](#report-a-bug)
  - [Suggest a Feature](#suggest-a-feature)
  - [Submit Code](#submit-code)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Local Development and Debugging](#local-development-and-debugging)
  - [Code Quality Checks](#code-quality-checks)
  - [Commit Conventions](#commit-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Release Process](#release-process)
- [License](#license)

---

## Code of Conduct

Please be respectful and kind. We expect all participants to follow the basic code of conduct of the open source community: respect others' opinions, provide constructive feedback, and focus on what is best for the project.

---

## How to Contribute

### Report a Bug

Submit bug reports via [GitHub Issues](https://github.com/bb-boy680/open-zread/issues). Please include the following information:

- **Steps to Reproduce**: Clear description of steps
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment Info**: OS, Node.js version, Bun version, open-zread version
- **Related Logs**: Include any error logs if available

Please search existing Issues before submitting to avoid duplicates.

### Suggest a Feature

Submit feature requests via [GitHub Issues](https://github.com/bb-boy680/open-zread/issues) as well. Please describe:

- The problem or scenario you want to solve
- The solution you expect
- Alternative approaches you've considered

### Submit Code

Fork the repository → Create a branch → Commit changes → Open a Pull Request. See [Pull Request Guidelines](#pull-request-guidelines) below for details.

---

## Development Environment Setup

### Prerequisites

| Tool | Version Requirement | Installation |
|------|-------------------|--------------|
| [Bun](https://bun.sh/) | >= 1.3.0 | `curl -fsSL https://bun.sh/install \| bash` |
| [Node.js](https://nodejs.org/) | >= 18 | Bundled with Bun, or install via nvm/fnm |
| [Git](https://git-scm.com/) | Any modern version | System package manager |

> **Note**: This project uses Bun as its package manager and runtime. Please do not use npm, yarn, or pnpm.

### Installation Steps

```bash
# 1. Fork and Clone the repository
git clone https://github.com/<your-username>/open-zread.git
cd open-zread

# 2. Install dependencies
bun install

# 3. Build all packages
bun run build

# 4. Verify the environment is ready
bun run typecheck
bun run lint
```

If all commands pass, your development environment is ready.

---

## Project Structure

```
open-zread/
├── apps/
│   ├── cli/                  # @open-zread/cli — Terminal UI entry point
│   └── browse/               # Wiki browsing frontend (Vite + React)
├── packages/
│   ├── types/                # @open-zread/types — Shared type definitions
│   ├── utils/                # @open-zread/utils — Common utility functions
│   ├── repo-analyzer/        # @open-zread/repo-analyzer — Code analysis engine
│   ├── agent-sdk/            # @open-zread/agent-sdk — Agent SDK
│   └── orchestrator/         # @open-zread/orchestrator — Wiki generation engine
├── turbo.json                # Turborepo task configuration
├── eslint.config.mjs         # ESLint configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Monorepo root configuration
```

### Package Dependencies

```
@open-zread/cli
    ├── @open-zread/orchestrator
    │       ├── @open-zread/agent-sdk
    │       ├── @open-zread/repo-analyzer
    │       └── @open-zread/utils
    ├── @open-zread/repo-analyzer
    ├── @open-zread/types
    └── @open-zread/utils
```

When modifying底层 packages (such as `types`), ensure that the builds of dependent packages are not broken.

---

## Development Workflow

### Local Development and Debugging

#### Start the Frontend Service

```bash
bun run dev
```

By default, this starts the Browse frontend service (Vite Dev Server). Changes to source code take effect **immediately** with hot reload support.

#### Debug the CLI

To run the CLI locally for debugging:

```bash
# 1. Navigate to the CLI directory
cd apps/cli

# 2. Link to global (only need to do this once)
bun link

# 3. Run from any directory
open-zread
```

> `bun link` registers the `open-zread` command globally, so you can call it directly from the terminal. After modifying source code, you need to **restart the CLI** for changes to take effect (no need to rebuild).

#### Single Package Operations

Turborepo supports running commands for individual packages:

```bash
bun run build --filter=@open-zread/cli        # Build only CLI
bun run dev --filter=@open-zread/orchestrator  # Develop only orchestrator
bun run typecheck --filter=@open-zread/types   # Typecheck only types
```

### Code Quality Checks

**You must run these checks after every code modification**:

```bash
bun run typecheck   # TypeScript type checking — required
bun run lint        # ESLint code style checks — required
```

If lint reports errors, try auto-fix:

```bash
bun run lint:fix    # ESLint auto-fix for fixable issues
```

#### Key ESLint Rules

- `no-explicit-any`: **Forbidden** to use `any` type — must provide a specific type
- `no-unused-vars`: Unused variables trigger warnings (variables prefixed with `_` are ignored)

### Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**type types**:

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `perf` | Performance improvement |
| `test` | Test-related |
| `chore` | Build, tools, dependency changes |
| `ci` | CI/CD configuration changes |

**scope**: Corresponds to package names, such as `cli`, `browse`, `types`, `utils`, `repo-analyzer`, `agent-sdk`, `orchestrator`.

**Examples**:

```
feat(cli): add wiki generation progress display
fix(repo-analyzer): resolve Vue SFC parsing error
docs: update contributing guide
chore(deps): bump web-tree-sitter to latest
```

---

## Pull Request Guidelines

### Pre-submission Checklist

- [ ] Code passes `bun run typecheck`
- [ ] Code passes `bun run lint`
- [ ] Complete unit tests are written for new features or bug fixes
- [ ] All tests pass (`bun test`)
- [ ] Commit messages follow Conventional Commits specification
- [ ] If public API is affected, related documentation is updated

### PR Process

1. **Fork** the repository to your GitHub account
2. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature
   ```
3. Develop and commit code (follow commit conventions)
4. Ensure all checks pass
5. Push to your Fork and open a Pull Request targeting `develop`

### PR Title

PR titles should follow the Conventional Commits format, for example:

- `feat(cli): add interactive config wizard`
- `fix(browse): fix markdown rendering for code blocks`

### PR Description

Please include the following:

1. **Description**: What you did and why
2. **Related Issue**: Include if there is one (e.g., `Closes #123`)
3. **Testing**: How to verify your changes
4. **Impact**: Whether it affects other packages or public APIs

### Review Process

- Maintainers will review PRs as soon as possible
- If changes are needed, append commits to the same branch (do not force push)
- After PR is merged, Changesets will automatically handle version releases

---

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) to manage releases.

### Add a Changeset

When your PR contains changes that need to be released (`feat`, `fix`, `perf`, etc.), please add a changeset:

```bash
bun run changeset
```

Follow the prompts to select:
1. Affected packages
2. Version type (`patch` / `minor` / `major`)
3. Change description

This generates a markdown file in the `.changeset/` directory. Please include it in your PR.

### Automatic Release

After a PR is merged into the `main` branch, CI will automatically:
1. Run `bun run version` to update version numbers
2. Create or update a Release PR
3. After the Release PR is merged, publish to npm automatically

---

## License

This project is open source under the [MIT License](./LICENSE). By submitting code, you agree to contribute your changes under the MIT license.
