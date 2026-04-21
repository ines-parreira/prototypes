import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DefaultOptions } from '@tanstack/react-query'
import type { RenderHookOptions } from '@testing-library/react'
import { renderHook as renderHookPrimitive } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { MemoryRouter, Route } from 'react-router-dom'

import { Toaster } from '@gorgias/axiom'

type SharedRenderHookOptions<TProps> = RenderHookOptions<TProps> & {
    initialEntries?: string[]
    path?: string
    queryClientOptions?: DefaultOptions
}

export const renderHook = <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: SharedRenderHookOptions<TProps>,
) => {
    const {
        initialEntries = ['/'],
        path = '/',
        queryClientOptions,
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

    const result = renderHookPrimitive(hook, {
        ...renderHookOptions,
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
        ...result,
    }
}
