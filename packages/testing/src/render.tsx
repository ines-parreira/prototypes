import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DefaultOptions } from '@tanstack/react-query'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import { render as renderPrimitive } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
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

type SharedRenderOptions<TStoreState extends object> = Omit<
    RenderOptions,
    'wrapper'
> & {
    initialEntries?: string[]
    dndBackend?: BackendFactory
    path?: string
    queryClientOptions?: DefaultOptions
    reduxMiddlewares?: Middleware[]
    storeState?: TStoreState | MockGetState<TStoreState>
    wrapper?: React.JSXElementConstructor<{ children: React.ReactNode }>
}

const defaultReduxMiddlewares: Middleware[] = [thunk as Middleware]

type SharedRenderResult<TStoreState extends object> = RenderResult & {
    store: MockStoreEnhanced<TStoreState>
    user: UserEvent
}

export const render = <TStoreState extends object = object>(
    ui: React.ReactElement,
    options?: SharedRenderOptions<TStoreState>,
): SharedRenderResult<TStoreState> => {
    const {
        initialEntries = ['/'],
        dndBackend = HTML5Backend,
        path,
        queryClientOptions,
        reduxMiddlewares = defaultReduxMiddlewares,
        storeState = {} as TStoreState,
        wrapper: ExtraWrapper,
        ...renderOptions
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
    const user = userEvent.setup()

    const result = renderPrimitive(ui, {
        ...renderOptions,
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

    Object.defineProperties(result, {
        store: {
            enumerable: true,
            value: store,
        },
        user: {
            enumerable: true,
            value: user,
        },
    })

    return result as SharedRenderResult<TStoreState>
}
