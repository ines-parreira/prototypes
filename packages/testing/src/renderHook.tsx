import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DefaultOptions } from '@tanstack/react-query'
import type {
    RenderHookOptions,
    RenderHookResult,
} from '@testing-library/react'
import { act, renderHook as renderHookPrimitive } from '@testing-library/react'
import type { BackendFactory } from 'dnd-core'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createPortal } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import type { Middleware } from 'redux'
import type { MockGetState, MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Toaster } from '@gorgias/axiom'

type SharedRenderHookOptions<TProps, TStoreState extends object> = Omit<
    RenderHookOptions<TProps>,
    'wrapper'
> & {
    dndBackend?: BackendFactory
    initialEntries?: string[]
    path?: string
    queryClientOptions?: DefaultOptions
    reduxMiddlewares?: Middleware[]
    storeState?: TStoreState | MockGetState<TStoreState>
    wrapper?: React.JSXElementConstructor<{ children: React.ReactNode }>
}

const defaultReduxMiddlewares: Middleware[] = [thunk as Middleware]

type SharedRenderHookResult<
    TResult,
    TProps,
    TStoreState extends object,
> = RenderHookResult<TResult, TProps> & {
    store: MockStoreEnhanced<TStoreState>
}

const renderHook = <TProps, TResult, TStoreState extends object = object>(
    hook: (props: TProps) => TResult,
    options?: SharedRenderHookOptions<TProps, TStoreState>,
): SharedRenderHookResult<TResult, TProps, TStoreState> => {
    const {
        dndBackend = HTML5Backend,
        initialEntries = ['/'],
        path,
        queryClientOptions,
        reduxMiddlewares = defaultReduxMiddlewares,
        storeState = {} as TStoreState,
        wrapper: ExtraWrapper,
        ...renderHookOptions
    } = options ?? {}

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                ...queryClientOptions?.queries,
            },
            mutations: {
                retry: false,
                ...queryClientOptions?.mutations,
            },
        },
    })
    const store = configureMockStore<TStoreState>(reduxMiddlewares)(storeState)

    const result = renderHookPrimitive(hook, {
        ...renderHookOptions,
        wrapper: ({ children }) => (
            <>
                {createPortal(<Toaster />, document.body)}
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={dndBackend}>
                            <MemoryRouter initialEntries={initialEntries}>
                                {path ? (
                                    <Route path={path}>
                                        {ExtraWrapper ? (
                                            <ExtraWrapper>
                                                {children}
                                            </ExtraWrapper>
                                        ) : (
                                            children
                                        )}
                                    </Route>
                                ) : ExtraWrapper ? (
                                    <ExtraWrapper>{children}</ExtraWrapper>
                                ) : (
                                    children
                                )}
                            </MemoryRouter>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
            </>
        ),
    })

    Object.defineProperty(result, 'store', {
        enumerable: true,
        value: store,
    })

    return result as SharedRenderHookResult<TResult, TProps, TStoreState>
}

export { act, renderHook }
