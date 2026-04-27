import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DefaultOptions } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'
import { render as renderPrimitive } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { BackendFactory } from 'dnd-core'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createPortal } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import type { Middleware } from 'redux'
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
    storeState?: TStoreState
    wrapper?: React.ComponentType<React.PropsWithChildren<unknown>>
}

const defaultReduxMiddlewares: Middleware[] = [thunk as Middleware]

export const render = <TStoreState extends object = object>(
    ui: React.ReactElement,
    options?: SharedRenderOptions<TStoreState>,
) => {
    const {
        initialEntries = ['/'],
        dndBackend = HTML5Backend,
        path = '/',
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
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <DndProvider backend={dndBackend}>
                            <MemoryRouter initialEntries={initialEntries}>
                                <Route path={path}>
                                    {ExtraWrapper ? (
                                        <ExtraWrapper>{children}</ExtraWrapper>
                                    ) : (
                                        children
                                    )}
                                </Route>
                            </MemoryRouter>
                        </DndProvider>
                    </QueryClientProvider>
                </Provider>
                {createPortal(<Toaster />, document.body)}
            </>
        ),
    })

    return {
        user,
        store,
        ...result,
    }
}
