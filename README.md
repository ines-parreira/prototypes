# Gorgias JavaScript Application

This js app is the frontend for the Gorgias helpdesk.
It's built using ReactJS + Redux + many other smaller tools.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)

## Installation

```sh
git clone git@github.com:gorgias/helpdesk-web-app.git
cd helpdesk-web-app
yarn install
```

## Development

Start the development server with:

```sh
yarn serve
```

The [HMR](https://webpack.js.org/concepts/hot-module-replacement) should
work out of the box.

### Storybook

Start the Storybook with:

```sh
yarn storybook
```

### Design tokens

We are using Zeroheight to manage the design tokens, in order to update them:

1. Get the updated tokens urls in the [resources](https://zeroheight.com/13b3ef892/p/09941c-design-tokens)
2. Update the `get-color-tokens` and `get-typography-tokens` script in `package.json`
3. Run `yarn generate-design-tokens`

## Testing

```
yarn test
yarn lint   # Only code linting
yarn types  # Only type-check
yarn jest   # Only unit tests
```

## Contributing

- [Gorgias Style Guide](https://github.com/gorgias/gorgias-style-guide)
- [Project Kaizen](./KAIZEN.md)
- [Storybook](./docs/GetStarted.stories.mdx)
- [FAQ](https://stackoverflow.com/c/gorgias/questions/tagged/30+22?sort=Newest&uqlId=1)
- [Helpdesk FE Chapter](https://www.notion.so/gorgias/c9bf0c5a9c5d4f9e902f9f5c65eb1f81?v=dfd8ad18869647bb9749752fc48be4b2)
