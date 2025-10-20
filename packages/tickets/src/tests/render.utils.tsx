import { ReactElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    renderHook as renderHookPrimitive,
    RenderOptions as RenderOptionsPrimitive,
    render as renderPrimitive,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { TicketsLegacyBridgeProvider } from '../utils/LegacyBridge'

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
    dispatchNotification?: ReturnType<typeof vi.fn>
    initialEntries?: string[]
    path?: string
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const {
        initialEntries = ['/'],
        path = '/',
        dispatchNotification = vi.fn(),
    } = options ?? {}

    const user = userEvent.setup()

    const result = renderPrimitive(element, {
        ...options,
        wrapper: ({ children }) => (
            <TicketsLegacyBridgeProvider
                dispatchNotification={
                    options?.dispatchNotification ?? dispatchNotification
                }
            >
                <QueryClientProvider client={testAppQueryClient}>
                    <MemoryRouter initialEntries={initialEntries}>
                        <Route path={path}>{children}</Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </TicketsLegacyBridgeProvider>
        ),
    })

    return {
        user,
        mocks: {
            dispatchNotification,
        },
        ...result,
    }
}

export const renderHook = <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: RenderOptions,
) => {
    const {
        initialEntries = ['/'],
        path = '/',
        dispatchNotification = vi.fn(),
    } = options ?? {}

    return renderHookPrimitive(hook, {
        ...options,
        wrapper: ({ children }) => (
            <TicketsLegacyBridgeProvider
                dispatchNotification={
                    options?.dispatchNotification ?? dispatchNotification
                }
            >
                <QueryClientProvider client={testAppQueryClient}>
                    <MemoryRouter initialEntries={initialEntries}>
                        <Route path={path}>{children}</Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </TicketsLegacyBridgeProvider>
        ),
    })
}
