# Gorgias JavaScript Application

This js app is the frontend for the Gorgias helpdesk.
It's built using ReactJS + Redux + many other smaller tools.

## Table of Contents

-   [Gorgias JavaScript Application](#gorgias-javascript-application)
    -   [Table of Contents](#table-of-contents)
    -   [Setup NPM to access private packages](#setup-npm-to-access-private-packages)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Development](#development)
        -   [Storybook](#storybook)
        -   [Design tokens](#design-tokens)
    -   [Testing](#testing)
        -   [General testing](#general-testing)
    -   [Linting](#linting)
        -   [Running Linting](#running-linting)
        -   [Adding Linting rules](#adding-linting-rules)
    -   [Debugging tools](#debugging-tools)
        -   [ReactScan](#react-scan)
        -   [whyDidYouRender](#why-did-you-render)
    -   [Formatting](#formatting)
    -   [Platform](#platform)
        -   [Deprecated entries](#deprecated-entries)
            -   [Generate new snapshot](#generate-new-snapshot)
            -   [Deprecated entries lint check](#deprecated-entries-lint-check)
            -   [Add new deprecated entries](#add-new-deprecated-entries)
        -   [Dependencies NodeJS Engine check](#dependencies-nodejs-engine-check)
    -   [Contributing](#contributing)
    -   [FAQ / Troubleshooting](#faq--troubleshooting)
        -   [yarn dependencies installation error](#yarn-dependencies-installation-error)
            -   [Possible solution](#possible-solution)
        -   [Revert PR was blocked by Codecov](#revert-pr-was-blocked-by-codecov)

## Setup NPM to access private packages

1. Follow these [guidelines](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) to create a GitHub access token with the `repo` and `read:packages` scopes.
2. Run `npm login --registry=https://npm.pkg.github.com --scope=@gorgias`.
3. Enter your GitHub username, your access token and your public email.

Please `cat ~/.npmrc` and ensure that `@gorgias:registry=https://npm.pkg.github.com` is present, otherwise prepend it manually.

## Prerequisites

-   [Node.js (v18, uses nvm to install)](https://nodejs.org/en/download/package-manager)
-   [Yarn](https://classic.yarnpkg.com/en/docs/install)
-   [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)

## Installation

```bash
git clone git@github.com:gorgias/helpdesk-web-app.git
cd helpdesk-web-app
nvm install && nvm use # (This uses the node version specified in the .nvmrc file)
yarn install
```

## Development

1. If you don't want run the backend on your machine, start the development server with:

```bash
yarn dev:proxy
```

You also need to have your proxy setup correctly. Follow the instructions [here](https://www.notion.so/gorgias/Using-local-dev-server-on-production-5c7d9cfd3bcb4c118e3f49e59c3e1d40#1efa9466a2724c95885c4219994d3fe7).

2. If you have the backend running on your machine, start the development server with:

```bash
yarn dev:local
```

The [HMR](https://webpack.js.org/concepts/hot-module-replacement) should work out of the box for both proxy and local development.

### Storybook

Start the Storybook with:

```bash
yarn storybook
```

### Design tokens

Tokens are provided by the `@gorgias/design-tokens` package.

## Testing

### General testing

```bash
yarn test
yarn typecheck  # Only type-check
yarn jest   # Only unit tests
```

## Linting

Due to performance concerns, we use [Oxlint](https://oxc.rs/docs/guide/usage/linter/rules.html) to lint our code. This will require you to install the extension relevant to your IDE:

-   [VSCode based IDE](https://oxc.rs/docs/guide/usage/linter.html#vscode-extension)
-   [ZED](https://oxc.rs/docs/guide/usage/linter.html#zed-extension)

For Neovim users, Oxlint should work [out of the box](https://github.com/neovim/nvim-lspconfig/pull/3586).

If you't editor doesn't support Oxc yet, please use the `yarn oxlint:watch` command to run it in watch mode while developping. It will run Oxlint with the --fix flag on the files you've changed.

### Running Linting

```bash
yarn lint
```

### Adding Linting rules

New linting [rules](https://oxc.rs/docs/guide/usage/linter/rules.html) can be added to the [oxlint.base.json](./scripts/oxlint/oxlint.base.json) file. The changes will be applied automatically when you run `yarn lint` via the `prelint` script.

## Debugging tools

To help identify unnecessary React component re-renders and improve performance during development, we’ve added two tools: [ReactScan](https://react-scan.com/) and [whyDidYouRender](https://github.com/welldone-software/why-did-you-render/tree/version-7). These tools are only active in development mode and have no impact on production builds.

### ReactScan

[ReactScan](https://react-scan.com/) is a visual development tool that highlights React components when they re-render. It shows a floating toolbar in the bottom-right corner with useful debugging info, such as render activity, notification count, and FPS.

We use ReactScan in development to help detect unnecessary re-renders and performance bottlenecks during UI work. It is completely disabled in production builds.

In our setup, ReactScan is:

-   Imported **before React** to ensure accurate tracking
-   Initialized only in development mode
-   Disabled by default to avoid flashing or distraction on page load

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

It’s particularly useful for tracking down components that re-render frequently or unexpectedly. We configure it in development mode only, and typically use it with selective tracking (not globally) to avoid console noise.

#### How it’s imported

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

That’s it — re-render info will now show up in your console whenever `MyComponent` re-renders, including a diff of the changed props or state.

You can also customize the behavior further with additional flags. See the [official docs](https://github.com/welldone-software/why-did-you-render#options) for more.

## Formatting

Formatting is done on save, via Prettier. Make sure to have the [Prettier extension](https://prettier.io/docs/editors) installed in your IDE.

## Platform

### Deprecated entries

#### Generate new snapshot

This script will generate a new snapshot of the deprecated code according to the `sa.config.ts` file.

```bash
yarn platform:deprecated-analysis
```

#### Deprecated entries lint check

This script will check if there are any new deprecated entries in the codebase based on the current snapshot.

```bash
yarn lint:deprecated
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

Once you add the `@deprecated` comment, you can run `yarn platform:deprecated-analysis` to generate a new snapshot.

### Dependencies NodeJS Engine check

This script will give you the list of dependencies which are incompatible with any specified NodeJS version.

Update the target version in the [dependencies-engines.ts](scripts/dependencies-management/dependencies-engines.ts) file

```typescript
const TARGET_VERSION = '22.0.0'
```

And run:

```bash
yarn platform:check-node-engines
```

## Contributing

-   [ADR](https://github.com/gorgias/architectural-decision-records/tree/main/project/helpdesk)
-   [Storybook](./docs/GetStarted.stories.mdx)
-   [FE Chapter](https://www.notion.so/gorgias/Front-End-Chapter-5045e25b1a1f4ab7a42dad4a0187f541)

## FAQ / Troubleshooting

### yarn dependencies installation error

Running `yarn install` leads to error

```bash
➤ YN0035: │ @gorgias/config@npm:0.1.0: The remote server failed to provide the requested resource
➤ YN0035: │   Response Code: 404 (Not Found)
➤ YN0035: │   Request Method: GET
➤ YN0035: │   Request URL: https://registry.yarnpkg.com/@gorgias%2fconfig
➤ YN0000: └ Completed in 11s 814ms
➤ YN0000: Failed with errors in 11s 817ms
```

This is because there is no registry configured with access to the package @gorgias/config.

#### Possible solution

-   Ensure you have yarn installed, if not [Yarn installation](https://yarnpkg.com/getting-started/install)
-   Configure registry for gorgias packages. For this:

    -   follow https://github.com/gorgias/gorgias/blob/main/README.md#setup-npm-to-access-private-packages to configure npm access to GitHub registry
    -   create your ~/.yarnrc.yml file

    ```bash
    npmRegistryServer: "https://registry.yarnpkg.com"
    npmScopes:
      gorgias:
        npmPublishRegistry: https://npm.pkg.github.com/
        npmRegistryServer: https://npm.pkg.github.com/
        npmAlwaysAuth: true
        npmAuthToken: _YOUR_TOKEN_
    ```

    -   `npmAuthToken` can be found in your ~/.npmrc

### Revert PR was blocked by Codecov

To disable the check that prevents your PR from merging, make sure
that the name of the branch starts with `revert/` or `revert-`.
