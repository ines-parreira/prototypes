import type { ReactElement } from 'react'

import { NavigationProvider } from '@repo/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
    RenderHookOptions as RenderHookOptionsPrimitive,
    RenderOptions as RenderOptionsPrimitive,
} from '@testing-library/react'
import {
    renderHook as renderHookPrimitive,
    render as renderPrimitive,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

export const testAppQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
})

type RenderOptions = RenderOptionsPrimitive & {
    initialEntries?: string[]
    path?: string
}

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> & {
    initialEntries?: string[]
    path?: string
}

const defaultOptions = {
    initialEntries: ['/'],
    path: '/',
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }

    const user = userEvent.setup()

    const result = renderPrimitive(element, {
        ...options,
        wrapper: ({ children }) => (
            <QueryClientProvider client={testAppQueryClient}>
                <NavigationProvider>
                    <MemoryRouter initialEntries={mergedOptions.initialEntries}>
                        <Route path={mergedOptions.path}>{children}</Route>
                    </MemoryRouter>
                </NavigationProvider>
            </QueryClientProvider>
        ),
    })

    return {
        user,
        ...result,
    }
}

export const renderHook = <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: RenderHookOptions<TProps>,
) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }

    return renderHookPrimitive(hook, {
        ...options,
        wrapper: ({ children }) => (
            <QueryClientProvider client={testAppQueryClient}>
                <NavigationProvider>
                    <MemoryRouter initialEntries={mergedOptions.initialEntries}>
                        <Route path={mergedOptions.path}>{children}</Route>
                    </MemoryRouter>
                </NavigationProvider>
            </QueryClientProvider>
        ),
    })
}
