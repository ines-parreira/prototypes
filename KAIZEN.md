# Kaizen

> The Japanese word kaizen means "change for better"
>
> -- <cite>[Wikipedia](https://en.wikipedia.org/wiki/Kaizen)</cite>

This document gathers knowledge about all the various ongoing efforts to
improve the technical side of the JavaScript application that are
not migrations: they don't have a strict timeline.

The scope and complexity of those efforts may vary significantly:
from the long-term architecture changes to library choices.

Please respect those choices making your code contributions but
also, feel free to post your ideas for improvements (in the form of a
PR).

## Turn on the @flow type-checking in the modified files

In the project, you need to have `// @flow` pragma comment at the
beginning of the file for flow to type-check it.

Currently, many files are not type-checked so to improve the
type-safety <ins>turn on the type-check in the files you modified in a PR
(by adding `// @flow` pragma at the top)</ins>.

Turning on the type check may require some additional work
with fixing/writing typing for that file eg. converting `propTypes`
to flow `type`. If turning on the type-check is difficult for a file or
it makes the PR over-bloated then you can decide to skip it.

## Migration from Js to Ts

The app is containing a mix of JavaScript files being typed with Flow or not.
We are aiming to migrate them to TypeScript as it is a better tool.

The general approach to migrating a file is:
1. If the file contains some exported types, move the declarations into `types.js` and `types.ts` file
2. Change the file extension from `.js` to either `.ts` or `.tsx` if the file contains jsx
3. Make adjustments
  - Remove the `@flow` pragma and all potential `$FlowFixMe`
  - In the imports:
```
import Foo, {type FooType} from 'foo'
```
Should become:
```
import Foo, {FooType} from 'foo'
// or
import Foo from 'foo'
import type {FooType} from 'foo'
```
> You can find more info on this in the [documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html)
  - Remove any existing cast like `(foo: Type)`
  - Remove any exact type like `{|foo: string|}`
  - Replace `?Type` with `Type | null | undefined`
  - Replace `$Keys<Foo>` with `keyof Foo`
  - Replace `$Values<Foo>` with `Foo[keyof Foo]`
  - Add missing parameters in function definitions such as `(Type) => void` becoming `(foo: Type) => void`
4.  TSC will most likely find some errors you'll have to fix. `yarn types`

#### Extra notes
- Some external types have different names in Flow and TypeScript: `import type {Node} from 'react'` becomes `import type {ReactNode} from 'react'`
- Some types brought by dependencies have to be defined through `@types` deps (eg `yarn add -D @types/react`)
- TypeScript assumes that an unspecified extension is either `.ts` or `.tsx`, for importing a JavaScript file you'll need to use `.js` extension explicitly
- For `index.js` files serving as export buffers you may find `export * from './types'`. These files should not be migrated as it allows Flow to access the types. Instead, consider having two separate `types.js` and `types.ts` files and export the JavaScript one like so: `export * from './types.js'` (notice the extension)
