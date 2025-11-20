import type { ReactElement } from 'react'

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

import { TicketsLegacyBridgeProvider } from '../utils/LegacyBridge'
import type { LegacyBridgeContextType } from '../utils/LegacyBridge/context'

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
    dispatchDismissNotification?: ReturnType<typeof vi.fn>
    ticketViewNavigation?: LegacyBridgeContextType['ticketViewNavigation']
    dispatchAuditLogEvents?: ReturnType<typeof vi.fn>
    dispatchHideAuditLogEvents?: ReturnType<typeof vi.fn>
    toggleQuickReplies?: ReturnType<typeof vi.fn>
    initialEntries?: string[]
    path?: string
}

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> & {
    dispatchNotification?: ReturnType<typeof vi.fn>
    dispatchDismissNotification?: ReturnType<typeof vi.fn>
    ticketViewNavigation?: LegacyBridgeContextType['ticketViewNavigation']
    dispatchAuditLogEvents?: ReturnType<typeof vi.fn>
    dispatchHideAuditLogEvents?: ReturnType<typeof vi.fn>
    toggleQuickReplies?: ReturnType<typeof vi.fn>
    initialEntries?: string[]
    path?: string
}

const defaultOptions = {
    initialEntries: ['/'],
    path: '/',
    dispatchNotification: vi.fn(),
    dispatchDismissNotification: vi.fn(),
    dispatchAuditLogEvents: vi.fn(),
    dispatchHideAuditLogEvents: vi.fn(),
    toggleQuickReplies: vi.fn(),
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
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }

    const user = userEvent.setup()

    const result = renderPrimitive(element, {
        ...options,
        wrapper: ({ children }) => (
            <TicketsLegacyBridgeProvider {...mergedOptions}>
                <QueryClientProvider client={testAppQueryClient}>
                    <MemoryRouter initialEntries={mergedOptions.initialEntries}>
                        <Route path={mergedOptions.path}>{children}</Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </TicketsLegacyBridgeProvider>
        ),
    })

    return {
        user,
        mocks: {
            dispatchNotification: mergedOptions.dispatchNotification,
            dispatchDismissNotification:
                mergedOptions.dispatchDismissNotification,
            dispatchAuditLogEvents: mergedOptions.dispatchAuditLogEvents,
            dispatchHideAuditLogEvents:
                mergedOptions.dispatchHideAuditLogEvents,
            toggleQuickReplies: mergedOptions.toggleQuickReplies,
        },
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
            <TicketsLegacyBridgeProvider {...mergedOptions}>
                <QueryClientProvider client={testAppQueryClient}>
                    <MemoryRouter initialEntries={mergedOptions.initialEntries}>
                        <Route path={mergedOptions.path}>{children}</Route>
                    </MemoryRouter>
                </QueryClientProvider>
            </TicketsLegacyBridgeProvider>
        ),
    })
}
