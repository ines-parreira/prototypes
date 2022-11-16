# Gorgias JavaScript Application

This js app is the frontend for the Gorgias helpdesk.
It's built using ReactJS + Redux + many other smaller tools.

## Table of Contents

- [Setup NPM to access private packages](#setup-npm-to-access-private-packages)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)

## Setup NPM to access private packages
1. Follow these [guidelines](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) to create a GitHub access token with the `repo` and `read:packages` scopes.
2. Run `npm login --registry=https://npm.pkg.github.com --scope=@gorgias`.
3. Enter your GitHub username, your access token and your public email.
Please `cat ~/.npmrc` and ensure that `@gorgias:registry=https://npm.pkg.github.com` is present, otherwise prepend it manually.

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


## FAQ / Troubleshooting
### yarn dependencies installation error
Running `yarn install` leads to error
```
➤ YN0035: │ @gorgias/javascript-shared-config@npm:0.1.0: The remote server failed to provide the requested resource
➤ YN0035: │   Response Code: 404 (Not Found)
➤ YN0035: │   Request Method: GET
➤ YN0035: │   Request URL: https://registry.yarnpkg.com/@gorgias%2fjavascript-shared-config
➤ YN0000: └ Completed in 11s 814ms
➤ YN0000: Failed with errors in 11s 817ms
```
This is because the is no registry configurated with access to the package @gorgias/javascript-shared-config.
#### Posible solution
- Ensure you have yarn installed, if not [Yarn installation](https://yarnpkg.com/getting-started/install)
- Configue registry for gorgias packages. For this:
  - follow https://github.com/gorgias/gorgias/blob/main/README.md#setup-npm-to-access-private-packages to configurate npm access to github registry
  - create your ~/.yarnrc.yml file
  ```sh
  npmRegistryServer: "https://registry.yarnpkg.com"
  npmScopes:
    gorgias:
      npmPublishRegistry: https://npm.pkg.github.com/
      npmRegistryServer: https://npm.pkg.github.com/
      npmAlwaysAuth: true
      npmAuthToken: _YOUR_TOKEN_
  ```
  - `npmAuthToken` can be found in your ~/.npmrc
