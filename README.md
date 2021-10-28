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
git clone https://github.com/gorgias/gorgias
cd gorgias
yarn install
```

## Development

Start the development server with:

```sh
yarn serve
```

The [HMR](https://webpack.js.org/concepts/hot-module-replacement) should
work out of the box.

Start the Storybook with:

```sh
yarn storybook
```

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
- [Improvement ideas](https://www.notion.so/gorgias/60a36be52f744bde9bf83ede1d31a06c?v=0442f705b1414194ac281795c4135ff4)
