# Gorgias JavaScript Application

This js app is the frontend for the Gorgias helpdesk.
It's built using ReactJS + Redux + many other smaller tools.

## Table of Contents

- [Gorgias JavaScript Application](#gorgias-javascript-application)
    - [Table of Contents](#table-of-contents)
    - [Setup NPM to access private packages](#setup-npm-to-access-private-packages)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
        - [AI Rules and Skills](#ai-rules-and-skills)
        - [PNPM Catalogs](#pnpm-catalogs)
        - [Updating SDKs](#updating-sdks)
        - [Release Age Configuration](#release-age-configuration)
    - [Development](#development)
        - [Environment Configuration](#environment-configuration)
            - [Initial Setup](#initial-setup)
        - [Running the Development Server](#running-the-development-server)
        - [Running the shared worker](#running-the-shared-worker)
        - [Storybook](#storybook)
            - [Story Guidelines](#story-guidelines)
            - [Storybook Folder Structure](#storybook-folder-structure)
        - [Design tokens](#design-tokens)
    - [Testing](#testing)
        - [General testing](#general-testing)
    - [CI/CD Workflow](#cicd-workflow)
        - [Overview](#overview)
        - [Workflow Structure](#workflow-structure)
        - [Quality Checks](#quality-checks)
        - [Code Coverage](#code-coverage)
        - [Deployment Pipeline](#deployment-pipeline)
    - [Linting](#linting)
        - [Running Linting](#running-linting)
        - [Adding Linting rules](#adding-linting-rules)
    - [Debugging tools](#debugging-tools)
        - [ReactScan](#reactscan)
        - [WhyDidYouRender](#whydidyourender)
            - [How it's imported](#how-its-imported)
            - [How to use it](#how-to-use-it)
    - [Formatting](#formatting)
    - [Platform](#platform)
        - [Deprecated entries](#deprecated-entries)
            - [Generate new snapshot](#generate-new-snapshot)
            - [Deprecated entries lint check](#deprecated-entries-lint-check)
            - [Add new deprecated entries](#add-new-deprecated-entries)
        - [Dependencies NodeJS Engine check](#dependencies-nodejs-engine-check)
    - [Contributing](#contributing)
    - [Update gorgias-chat client](#update-gorgias-chat-client)
    - [FAQ / Troubleshooting](#faq--troubleshooting)
        - [Revert PR was blocked by Codecov](#revert-pr-was-blocked-by-codecov)

## Setup NPM to access private packages

1. Follow these [guidelines](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) to create a GitHub access token with the `repo` and `read:packages` scopes.
2. Run `npm login --registry=https://npm.pkg.github.com --scope=@gorgias`.
3. Enter your GitHub username, your access token and your public email.

Please `cat ~/.npmrc` and ensure that `@gorgias:registry=https://npm.pkg.github.com` is present, otherwise prepend it manually.

## Prerequisites

- [Node.js (v22, uses nvm to install)](https://nodejs.org/en/download/package-manager)
- [pnpm](https://pnpm.io/installation)
- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)

## Installation

```bash
git clone git@github.com:gorgias/helpdesk-web-app.git
cd helpdesk-web-app
nvm install && nvm use # (This uses the node version specified in the .nvmrc file)
pnpm install
```

### AI Rules and Skills

AI rules, commands, and skills are managed from `.rulesync/`. Edit the shared source files there instead of editing generated tool-specific files directly.

- Repo-wide guidance lives in `.rulesync/rules/`
- Shared commands live in `.rulesync/commands/`
- Shared skills live in `.rulesync/skills/`

Running `pnpm install` triggers `postinstall`, which runs `pnpm ai:rulesync` and regenerates the local files for Claude Code, Codex CLI, Cursor, and OpenCode. You can also run `pnpm ai:rulesync` manually after changing `.rulesync`.

If you get an error about a missing skill in a given folder (`.curated` for example), removed said folder and reinstall: `rm -rf .rulesync/skills/{folder_name} && pnpm install`.

Generated files such as `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`, `.cursor/`, and `.opencode/` are ignored by Git and should not be edited by hand.

### PNPM Catalogs

This project uses [PNPM Catalogs](https://pnpm.io/catalogs) to manage dependency versions across the workspace. Catalogs allow defining dependency versions as reusable constants in `pnpm-workspace.yaml`, which can then be referenced in `package.json` files using the `catalog:` protocol (e.g., `"@gorgias/helpdesk-queries": "catalog:rest-api-sdk"`).

This helps maintain unique versions, signal that some dependencies should be changed together, simplifies upgrades, and reduces merge conflicts. You can see the catalog definitions in the `pnpm-workspace.yaml` file and references in the `package.json` files (e.g., `react: catalog:react`).

To update a package whose version is specified in a catalog, you need to update the catalog itself in the `pnpm-workspace.yaml` file manually. The `pnpm update` command [doesn't yet support the catalogs for now](https://pnpm.io/catalogs#caveats).

### Updating SDKs

To update the SDKs, you can use the `pnpm platform:update:sdk` command (ie. `pnpm platform:update:sdk helpdesk`)
This will bump all the services' packages to their latest version (updating correctly both the workspace/catalogs manifest and the lockfile).

### Release Age Configuration

This project uses PNPM's `minimumReleaseAge` feature to ensure package stability by preventing installation of packages that are too new. The configuration is defined in `pnpm-workspace.yaml`:

- **`minimumReleaseAge: 4320`**: Packages must be at least 4320 minutes (72 hours) old before they can be installed
- **`minimumReleaseAgeExclude`**: A list of trusted packages that are exempt from the minimum release age requirement

The excluded packages include all internal Gorgias packages (like `@gorgias/helpdesk-client`, `@gorgias/design-tokens`, etc.). This ensures that internal packages can be updated immediately while external packages have a 24-hour "cooling off" period to catch any critical issues before adoption.

To modify this behavior, update the `minimumReleaseAge` value (in minutes) or add/remove packages from the `minimumReleaseAgeExclude` list in `pnpm-workspace.yaml`.

When trying to install a package that isn't doesn't respect the `minimumReleaseAge` you will get the following error: `ERR_PNPM_NO_MATCHING_VERSION No matching version found for [...]`

## Development

### Environment Configuration

This project uses environment variables for development configuration. Follow these steps to set up your local environment:

#### Initial Setup

1. **Copy the environment template:**

    ```bash
    cp apps/helpdesk/.env.example apps/helpdesk/.env
    ```

2. **Edit `.env` with your personal settings:**
    ```bash
    DEVELOPER_NAME=your-actual-name
    ```

**Note:** Environment variables in `.env` are only used in development builds and do not affect production.

### Running the Development Server

1. If you don't want run the backend on your machine, start the development server with:

```bash
pnpm dev:proxy
```

You also need to have your proxy setup correctly. Follow the instructions [here](https://www.notion.so/gorgias/Using-local-dev-server-on-production-5c7d9cfd3bcb4c118e3f49e59c3e1d40#1efa9466a2724c95885c4219994d3fe7).

2. If you have the backend running on your machine, start the development server with:

```bash
pnpm dev:local
```

The [HMR](https://webpack.js.org/concepts/hot-module-replacement) should work out of the box for both proxy and local development.

### Running the shared worker

1. In proxy mode, without a local backend, use this command:

```bash
pnpm --filter @repo/helpdesk dev:workers:proxy
```

2. If you have a local backend:

```bash
pnpm --filter @repo/helpdesk serve:sharedWorker
```

### Storybook

Start the Storybook with:

```bash
pnpm --filter @repo/helpdesk storybook:dev
```

#### Story Guidelines

1. Create a story for each state of the component.
2. Think about forwarding refs and memoized components
3. Each component that is shared should be placed in `pages/common` folder and needs to have a file `{fileName}.stories.tsx` for stories.
4. [Use args](https://storybook.js.org/docs/writing-stories#using-args) and never hardcode the props passed to the story → Allow UI [Controls](https://storybook.js.org/docs/essentials/controls) to manipulate the component.
5. [Use decorators](https://storybook.js.org/docs/writing-stories#using-decorators) if your component has dependencies that need to be injected (e.g. drag and drop provider).

#### Storybook Folder Structure

- **General**: Composable components e.g. buttons, icon, text that we will reuse to build the rest of our component library
- **Navigation**: Components related to navigation like menu, breadcrumbs, page header, dropdowns
- **Data Entry**: Forms related components (inputs, checkboxes, uploads etc.)
- **Data Display**: Badges, Cards, Images, Lists, Avatars, Tables etc.
- **Charts (could be nested in Data Display)**: This falls in the data display category but we can make its own category if it gets big enough
- **Feedback**: Components that we display as consequence of an user action like Alerts, Notifications, Modals, Loaders
- **Layout**: Components that we use to build a page skeleton like grid system, dividers

### Design tokens

Tokens are provided by the `@gorgias/design-tokens` package.

## Testing

### General testing

```bash
pnpm test:all  # all tests
pnpm test:affected  # run tests affected by changes w.r.t. main branch
pnpm test <package-name>  # tests for a given package

pnpm typecheck:all  # Only type-check
pnpm typecheck:affected  # Only type-check on affected files
pnpm typecheck <package-name>  # Only type-check for a specific package.
```

## CI/CD Workflow

### Overview

The project uses GitHub Actions for continuous integration and deployment. The main workflow is defined in `.github/workflows/cicd.yml` and orchestrates quality checks, builds, and deployments across different environments.

### Workflow Structure

The CI/CD pipeline consists of several key jobs:

1. **Workspace Setup**: Analyzes affected packages using NX to optimize the build process
2. **Quality Check**: Runs linting, formatting, type checking, and tests
3. **Build**: Creates optimized production builds for different environments
4. **Deploy**: Deploys to staging (on `staging` branch) or production (on `main` branch)

### Quality Checks

The quality check workflow (`.github/workflows/quality-check.yml`) runs:

- **Linting**: Uses NX to run lint checks on affected packages
- **Formatting**: Ensures code formatting consistency
- **Type Checking**: Validates TypeScript types across the codebase
- **Testing**: Runs tests in parallel across 10 shards for the main helpdesk app
- **Package Tests**: Runs tests for affected packages in the monorepo

Tests are intelligently skipped for unaffected packages to optimize CI time.

### Code Coverage

Code coverage is managed through Codecov with the following features:

- **Coverage Targets**:
    - Project coverage: Auto-calculated with 0.5% threshold
    - Patch coverage: 80% target for new code
- **Flag Management**: Coverage is tracked per test shard and package
- **Carryforward**: Coverage from previous commits is carried forward when tests are skipped
- **Reporting**: Coverage reports are uploaded for both the main app and individual packages

Configuration is defined in `codecov.yaml`

### Deployment Pipeline

The deployment process varies by branch:

- **Feature Branches**: Build smoke tests only (no deployment)
- **Staging Branch**:
    - Builds with staging assets URL
    - Deploys to staging clusters
    - Creates Sentry releases for error tracking
- **Main Branch**:
    - Builds production artifacts
    - Deploys to multiple production clusters across regions
    - Creates production Sentry releases
    - Builds Docker images for containerized deployments

The build process (`.github/workflows/build.yml`) handles:

- Asset URL configuration per environment
- Build artifact creation and caching
- Release versioning

The deploy process (`.github/workflows/deploy.yml`) manages:

- Google Cloud authentication
- Asset publishing to GCS buckets
- Kubernetes ConfigMap updates
- Multi-cluster deployments
- Sentry source map uploads

## Linting

Due to performance concerns, we use [Oxlint](https://oxc.rs/docs/guide/usage/linter/rules.html) to lint our code. This will require you to install the extension relevant to your IDE:

- [VSCode based IDE](https://oxc.rs/docs/guide/usage/linter.html#vscode-extension)
- [ZED](https://oxc.rs/docs/guide/usage/linter.html#zed-extension)

For Neovim users, Oxlint should work [out of the box](https://github.com/neovim/nvim-lspconfig/pull/3586).

If you't editor doesn't support Oxc yet, please use the `pnpm oxlint:watch` command to run it in watch mode while developing. It will run Oxlint with the --fix flag on the files you've changed.

### Running Linting

```bash
pnpm lint:helpdesk  # run lint on the helpdesk, including deprecation checks
pnpm lint <package-name> # run lint for a specific package.
pnpm lint:code:all  # run lint everywhere
```

### Adding Linting rules

New linting [rules](https://oxc.rs/docs/guide/usage/linter/rules.html) can be added to the [oxlint-base.json](https://github.com/gorgias/frontend/blob/main/packages/config/oxlint-base.json) file in the config package in `frontend` monorepo.

## Debugging tools

To help identify unnecessary React component re-renders and improve performance during development, we've added two tools: [ReactScan](https://react-scan.com/) and [whyDidYouRender](https://github.com/welldone-software/why-did-you-render/tree/version-7). These tools are only active in development mode and have no impact on production builds.

### ReactScan

[ReactScan](https://react-scan.com/) is a visual development tool that highlights React components when they re-render. It shows a floating toolbar in the bottom-right corner with useful debugging info, such as render activity, notification count, and FPS.

We use ReactScan in development to help detect unnecessary re-renders and performance bottlenecks during UI work. It is completely disabled in production builds.

In our setup, ReactScan is:

- Imported **before React** to ensure accurate tracking
- Initialized only in development mode
- Disabled by default to avoid flashing or distraction on page load

You can find its integration in [`src/main/init/index.tsx`](src/main/init/index.tsx). Here's a simplified view of how it's used:

```ts
import React from 'react'

// This is to force react-scan to be imported always before 'React'
// and guarantee that the rule is applied
// eslint-disable-next-line no-empty-pattern
let reactScan = { scan: ({}) => {} }
if (process.env.NODE_ENV === 'development') {
    reactScan = require('react-scan')
}

// Only import and run scan in development
if (process.env.NODE_ENV === 'development') {
    reactScan.scan({
        enabled: false,
        log: false,
        showFPS: true,
        showNotificationCount: true,
        showToolbar: true,
    })
}
```

1. **From the UI toggle (recommended)**
   When ReactScan is loaded, a small floating toolbar appears in the bottom-right corner of the screen during development. You can use the toggle switch in this UI to enable or disable it in real time — no need to reload the page or touch any code.

2. **Via DevTools using localStorage**

```js
localStorage.setItem(
    'react-scan-options',
    JSON.stringify({
        'react-scan': {
            enabled: true,
        },
    }),
)
location.reload()
```

3. **Permanently by editing the code**
   In `src/main/init/index.tsx`, you can change the `enabled` option to `true`:

```ts
reactScan.scan({
    enabled: true,
    ...
})
```

### WhyDidYouRender

[whyDidYouRender](https://github.com/welldone-software/why-did-you-render/tree/version-7) is a dev-only library that logs re-renders in the console, along with the reason why a component re-rendered (e.g. prop or state changes).

It's particularly useful for tracking down components that re-render frequently or unexpectedly. We configure it in development mode only, and typically use it with selective tracking (not globally) to avoid console noise.

#### How it's imported

`whyDidYouRender` is imported and initialized only in development mode in `src/main/init/index.tsx`:

```ts
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render')

    whyDidYouRender(React, {
        trackAllPureComponents: false,
    })
}
```

This attaches the debugging logic to React without affecting production builds.

#### How to use it

To track a specific component, simply add the following line after the component definition:

```ts
ComponentName.whyDidYouRender = true
```

For example:

```ts
const MyComponent = () => {
    // ...
}

MyComponent.whyDidYouRender = true
```

That's it — re-render info will now show up in your console whenever `MyComponent` re-renders, including a diff of the changed props or state.

You can also customize the behavior further with additional flags. See the [official docs](https://github.com/welldone-software/why-did-you-render#options) for more.

## Formatting

Formatting is done on save, via Prettier. Make sure to have the [Prettier extension](https://prettier.io/docs/editors) installed in your IDE.

## Platform

### Deprecated entries

#### Generate new snapshot

This script will generate a new snapshot of the deprecated code according to the `sa.config.ts` file.

```bash
pnpm platform:deprecated-analysis
```

#### Deprecated entries lint check

This script will check if there are any new deprecated entries in the codebase based on the current snapshot.

```bash
pnpm lint:deprecated
```

#### Add new deprecated entries

To add new deprecated entries, you can use the `@deprecated` JSDoc comment, with a following `@date` (used to prioritize the deprecation) and an optional `@type` which is used to categorize the deprecation (e.g. `ui-migration`).

```tsx
/**
 * @deprecated
 * @date 2025-01-09
 * @type ui-migration
 */
const Component = () => {
    // ...
}
```

Once you add the `@deprecated` comment, you can run `pnpm platform:deprecated-analysis` to generate a new snapshot.

### Dependencies NodeJS Engine check

This script will give you the list of dependencies which are incompatible with any specified NodeJS version.

Update the target version in the [dependencies-engines.ts](scripts/dependencies-management/dependencies-engines.ts) file

```typescript
const TARGET_VERSION = '22.0.0'
```

And run:

```bash
pnpm platform:check-node-engines
```

## Contributing

- [ADR](https://github.com/gorgias/architectural-decision-records/tree/main/project/helpdesk)
- [Storybook](./docs/GetStarted.stories.mdx)
- [FE Chapter](https://www.notion.so/gorgias/Front-End-Chapter-5045e25b1a1f4ab7a42dad4a0187f541)

## Update gorgias-chat client

To run the `gorgiaschat:update-client` script, you first need to install [postman-to-openapi](https://github.com/joolfe/postman-to-openapi#readme).
Since this tool is not maintained and its package.json configuration make not compatible with recent NodeJS version you will need to install it globally and not into this project. For that run the following command:

```bash
pnpm add -g postman-to-openapi
pnpm gorgiaschat:update-client
```

## FAQ / Troubleshooting

### Revert PR was blocked by Codecov

To disable the check that prevents your PR from merging, make sure
that the name of the branch starts with `revert/` or `revert-`.
