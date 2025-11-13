import { ReactElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    RenderHookOptions as RenderHookOptionsPrimitive,
    renderHook as renderHookPrimitive,
    RenderOptions as RenderOptionsPrimitive,
    render as renderPrimitive,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { TicketsLegacyBridgeProvider } from '../utils/LegacyBridge'
import { LegacyBridgeContextType } from '../utils/LegacyBridge/context'

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
    ticketViewNavigation?: LegacyBridgeContextType['ticketViewNavigation']
    initialEntries?: string[]
    path?: string
}

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> & {
    dispatchNotification?: ReturnType<typeof vi.fn>
    ticketViewNavigation?: LegacyBridgeContextType['ticketViewNavigation']
    initialEntries?: string[]
    path?: string
}

const defaultOptions = {
    initialEntries: ['/'],
    path: '/',
    dispatchNotification: vi.fn(),
    ticketViewNavigation: {
        shouldDisplay: false,
        shouldUseLegacyFunctions: false,
        previousTicketId: undefined,
        nextTicketId: undefined,
        legacyGoToPrevTicket: vi.fn(),
        isPreviousEnabled: false,
        legacyGoToNextTicket: vi.fn(),
        isNextEnabled: false,
    },
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const {
        initialEntries = defaultOptions.initialEntries,
        path = defaultOptions.path,
        dispatchNotification = defaultOptions.dispatchNotification,
        ticketViewNavigation = defaultOptions.ticketViewNavigation,
    } = options ?? {}

    const user = userEvent.setup()

    const result = renderPrimitive(element, {
        ...options,
        wrapper: ({ children }) => (
            <TicketsLegacyBridgeProvider
                dispatchNotification={
                    options?.dispatchNotification ?? dispatchNotification
                }
                ticketViewNavigation={
                    options?.ticketViewNavigation ?? ticketViewNavigation
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
    options?: RenderHookOptions<TProps>,
) => {
    const {
        initialEntries = defaultOptions.initialEntries,
        path = defaultOptions.path,
        dispatchNotification = defaultOptions.dispatchNotification,
        ticketViewNavigation = defaultOptions.ticketViewNavigation,
    } = options ?? {}

    return renderHookPrimitive(hook, {
        ...options,
        wrapper: ({ children }) => (
            <TicketsLegacyBridgeProvider
                dispatchNotification={
                    options?.dispatchNotification ?? dispatchNotification
                }
                ticketViewNavigation={
                    options?.ticketViewNavigation ?? ticketViewNavigation
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
