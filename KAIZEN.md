# Kaizen

> The Japanese word kaizen means "change for better"
>
> -- <cite>[Wikipedia](https://en.wikipedia.org/wiki/Kaizen)</cite>

This document gathers knowledge about all the various ongoing efforts to
improve the technical side of the JavaScript application that don't have a strict timeline.
The scope and complexity of those efforts may vary significantly:
from the long-term architecture changes to library choices.

Please respect those decisions while making your code contributions but
also, feel free to post your ideas for improvements (in the form of a
PR).

## Table of contents

* [Turn on the @flow type-checking in the modified files](#turn-on-the-flow-type-checking-in-the-modified-files)
* [Migration from Js to Ts](#migration-from-js-to-ts)
* [Don't use Enzyme in new code](#migration-from-enzyme-to-react-testing-library)
* [Use Redux Toolkit to write actions and reducers](#use-redux-toolkit-to-write-actions-and-reducers)
* [Separate UI and Entity reducers](#separate-ui-and-entity-reducers)
* [Don't write actions with Axios calls](#dont-write-actions-with-axios-calls)

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
  - When migrating existing types `type fooType` should become `type Foo`
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
- And the opposite is also true, when importing TypeScript files in JavaScript we should explicitly add the extension `.ts` or `.tsx`
- For `index.js` files serving as export buffers you may find `export * from './types'`. These files should not be migrated as it allows Flow to access the types. Instead, consider having two separate `types.js` and `types.ts` files and export the JavaScript one like so: `export * from './types.js'` (notice the extension)
- When importing some TypeScript from any JavaScript files, replace the path to the direct export instead. Otherwise the typechecker won't be able to infer the imported types.
- We are referencing constants with `const Object.freeze()`, thanks to TypeScript we are able to define `enum` properly.
```
const foo = Object.freeze({
  BAR: 'bar',
  BAZ: 'baz',
})
// becomes
enum Foo {
  Bar = 'bar',
  Baz = 'baz',
}
```
- When importing `Object.freeze` constants, import Typescript enum instead.
- You may want to keep some code in order to prevent existing JavaScript to break, (such as keeping a `Object.freeze` declaration instead of an `enum`). You can flag the relevant part with the `$TsFixMe explaination` comment.
- When migrating types you may find some missing/wrong types, if the changes are too much for the current scope we are flagging these in issue [6221](https://github.com/gorgias/gorgias/issues/6221)

## Migration from Enzyme to react-testing-library

Please use [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro)
when writing new code.

When working on tests that still use Enzyme, please migrate them to RTL first.
If migrating test is non-trivial you may decide to postpone it and create a separate issue for migrating it
as a subtask of [Migrate Enzyme to react-testing-library #6608](https://github.com/gorgias/gorgias/issues/6608).

## Use Redux Toolkit to write actions and reducers

In the new redux code use [Redux Toolkit](https://redux-toolkit.js.org/) library. Specifically:
* [`createAction`](https://redux-toolkit.js.org/api/createAction#createaction) - to add actions to `actions.ts` file;
* [`createReducer`](https://redux-toolkit.js.org/api/createAction#createaction) - to write a reducer in `reducer.ts` file.

Try to [avoid thunk actions](#dont-write-actions-with-axios-calls), but if you have to, please use
[`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk#createasyncthunk) to write them.

## Separate UI and Entity reducers

When writing new reducers, please
[organize them in separate directories](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#organizing-normalized-data-in-state):
* `state/entities/*` - normalized state reducers;
* `state/ui/*` - non-normalized, ui state reducers.

If it works in your particular case, you may want to use
[`createEntityAdapter`](https://redux-toolkit.js.org/api/createEntityAdapter#createentityadapter)
to create entity reducers.

The rule of thumb is:
* REST call results should go to `state/entities/*`, for example: `state/entities/users/{actions,reducer,constants}.ts`;
* State that is shared between components should go to `state/ui/*`, for example: `state/entities/ui/ticketNavbar/{actions,reducers,constants}.ts`.

## Don't write actions with Axios calls

In order to keep actions as simple as possible please avoid adding new asynchronous thunks.\
If you have to write code for making a call to a remote server please add it to:
* `models/*` - for Gorgias REST API calls.\
  Every resource should have its own separate directory, e.g.
`models/user/{resources,types}.ts`;
* `services/*` - for communicating with other (usually 3rd-party) services.
