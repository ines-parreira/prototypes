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

-   [Migration from Js to Ts](#migration-from-js-to-ts)
-   [Don't use Enzyme in new code](#migration-from-enzyme-to-react-testing-library)
-   [Use Redux Toolkit to write actions and reducers](#use-redux-toolkit-to-write-actions-and-reducers)
-   [Separate UI and Entity reducers](#separate-ui-and-entity-reducers)
-   [Don't write actions with Axios calls](#dont-write-actions-with-axios-calls)
-   [Migration to Functional Components](#migration-to-functional-components)

## Migration from Js to Ts

Even though we completed the Flow to TS migration, the app still contains plain JavaScript files.
We are aiming to migrate them to TypeScript as it is a better tool.

> You can find more info on this in the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)

The general approach to migrating a file is:

1. If the file can benefit from some exported types, write the declarations in a `types.ts` file.
    - A new type should be named as `type Foo`.

2. Change the file extension from `.js` to either `.ts` or `.tsx` if the file contains JSX.

3. Make adjustments:
-   Add missing parameters in function definitions such as `(Type) => void` becoming `(foo: Type) => void`.
-   Avoid `Maybe<T>` types as they are a remnant of the Flow to TypeScript migration, and whenever you have the occasion, try redefining `Maybe<T>` types.
-   Type imports should be performed as:
```
import Foo, {FooType} from 'foo'
// or
import Foo from 'foo'
import type {FooType} from 'foo'
```

4.  TSC will most likely find some errors you'll have to fix. You can look for these by running `yarn types`.

#### Extra notes

-   Some types brought by dependencies have to be defined through `@types` deps (eg `yarn add -D @types/react`).
-   TypeScript assumes that an unspecified extension is either `.ts` or `.tsx`, for importing a JavaScript file you'll need to use `.js` extension explicitly.
-   Inversely, when importing TypeScript files in JavaScript we should explicitly add the extension `.ts` or `.tsx`.
-   When importing some TypeScript from any JavaScript files, import from the path to the direct export instead of `index.ts` files. Otherwise the typechecker won't be able to infer the imported types.
-   We are referencing constants with `const Object.freeze()`, thanks to TypeScript we are able to define `enum` properly.

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

-   When importing `Object.freeze` constants, import Typescript enum instead.
-   You may want to keep some code in order to prevent existing JavaScript to break, (such as keeping a `Object.freeze` declaration instead of an `enum`). You can flag the relevant part with the `$TsFixMe explaination` comment.
-   When migrating you may find some missing / incomplete / wrong types in the existing TS files, if the changes are too much for the current scope we are flagging these in issue [COR-359](https://linear.app/gorgias/issue/COR-359/enhance-existing-types).

#### Typing defaultProps of the class components

When typing out `defaultProps` please use the following form:

```js
type Props = {
    prop1: T
    prop2: U
    prop3: V
}

static defaultProps: Pick<Props, 'prop1' | 'prop2'>
```

You can see more info on the reasoning behind this in the official TypeScript [docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#caveats).

-   Additionally if a prop is **optional**, and you provide a **defaultProp** for it - you can leave it as required (no question mark), as it will never be `undefined`.

## Migration from Enzyme to react-testing-library

Please use [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro)
when writing new code.

When working on tests that still use Enzyme, please migrate them to RTL first.
If migrating test is non-trivial you may decide to postpone it and create a separate issue for migrating it
as a subtask of [Migrate Enzyme to react-testing-library #6608](https://github.com/gorgias/gorgias/issues/6608).

## Use Redux Toolkit to write actions and reducers

In the new redux code use [Redux Toolkit](https://redux-toolkit.js.org/) library. Specifically:

-   [`createAction`](https://redux-toolkit.js.org/api/createAction#createaction) - to add actions to `actions.ts` file;
-   [`createReducer`](https://redux-toolkit.js.org/api/createAction#createaction) - to write a reducer in `reducer.ts` file.

Try to [avoid thunk actions](#dont-write-actions-with-axios-calls), but if you have to, please use
[`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk#createasyncthunk) to write them.

## Separate UI and Entity reducers

When writing new reducers, please
[organize them in separate directories](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#organizing-normalized-data-in-state):

-   `state/entities/*` - normalized state reducers;
-   `state/ui/*` - non-normalized, ui state reducers.

If it works in your particular case, you may want to use
[`createEntityAdapter`](https://redux-toolkit.js.org/api/createEntityAdapter#createentityadapter)
to create entity reducers.

The rule of thumb is:

-   REST call results should go to `state/entities/*`, for example: `state/entities/users/{actions,reducer,constants}.ts`;
-   State that is shared between components should go to `state/ui/*`, for example: `state/entities/ui/ticketNavbar/{actions,reducers,constants}.ts`.

## Don't write actions with Axios calls

In order to keep actions as simple as possible please avoid adding new asynchronous thunks.\
If you have to write code for making a call to a remote server please add it to:

-   `models/*` - for Gorgias REST API calls.\
     Every resource should have its own separate directory, e.g.
    `models/user/{resources,types}.ts`;
-   `services/*` - for communicating with other (usually 3rd-party) services.

## Migration to Functional Components

Don't create any new Class Components, go for Functional Components instead.

When modifying Class Components you can decide to convert them to Functional Components first
or to create a separate issue for migrating it later as a subtask of
[Migrate to functional components #7298](https://github.com/gorgias/gorgias/issues/7298).

If you need to reuse a component logic, prioritize Hooks over HOC.
Always create a Hook first, then you can also write a thin HOC wrapper for the Hook as the situation demands.
The same procedure applies when migrating the existing HOC: convert it to a Hook and write a HOC wrapper for it
(only if it's required).
