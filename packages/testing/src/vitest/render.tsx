import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DefaultOptions } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'
import { render as renderPrimitive } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createPortal } from 'react-dom'
import { MemoryRouter, Route } from 'react-router-dom'

import { Toaster } from '@gorgias/axiom'

type SharedRenderOptions = RenderOptions & {
    initialEntries?: string[]
    path?: string
    queryClientOptions?: DefaultOptions
}

export const render = (
    ui: React.ReactElement,
    options?: SharedRenderOptions,
) => {
    const {
        initialEntries = ['/'],
        path = '/',
        wrapper: ExtraWrapper,
        queryClientOptions,
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

    const user = userEvent.setup()

    const result = renderPrimitive(ui, {
        ...renderOptions,
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Route path={path}>
                        {ExtraWrapper ? (
                            <ExtraWrapper>{children}</ExtraWrapper>
                        ) : (
                            children
                        )}
                    </Route>
                </MemoryRouter>
                {createPortal(<Toaster />, document.body)}
            </QueryClientProvider>
        ),
    })

    return {
        user,
        ...result,
    }
}
