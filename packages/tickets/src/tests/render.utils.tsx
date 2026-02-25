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
            staleTime: 0,
            cacheTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
})

type LegacyBridgeOptions = {
    dispatchNotification?: LegacyBridgeContextType['dispatchNotification']
    dispatchDismissNotification?: LegacyBridgeContextType['dispatchDismissNotification']
    ticketViewNavigation?: LegacyBridgeContextType['ticketViewNavigation']
    dispatchAuditLogEvents?: LegacyBridgeContextType['dispatchAuditLogEvents']
    dispatchHideAuditLogEvents?: LegacyBridgeContextType['dispatchHideAuditLogEvents']
    toggleQuickReplies?: LegacyBridgeContextType['toggleQuickReplies']
    onToggleUnread?: LegacyBridgeContextType['onToggleUnread']
    handleTicketDraft?: LegacyBridgeContextType['handleTicketDraft']
    makeOutboundCall?: LegacyBridgeContextType['makeOutboundCall']
    voiceDevice?: LegacyBridgeContextType['voiceDevice']
    dtpToggle?: LegacyBridgeContextType['dtpToggle']
    dtpEnabled?: LegacyBridgeContextType['dtpEnabled']
    humanizeChannel?: LegacyBridgeContextType['humanizeChannel']
}

type RenderOptions = RenderOptionsPrimitive &
    LegacyBridgeOptions & {
        initialEntries?: string[]
        path?: string
    }

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> &
    LegacyBridgeOptions & {
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
    onToggleUnread: vi.fn(),
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
    handleTicketDraft: {
        hasDraft: false,
        onResumeDraft: vi.fn(),
        onDiscardDraft: vi.fn(),
    },
    makeOutboundCall: vi.fn(),
    voiceDevice: {
        device: {},
        call: null,
    },
    dtpToggle: {
        isEnabled: false,
        setIsEnabled: vi.fn(),
        previousTicketId: undefined,
        nextTicketId: undefined,
        setPrevNextTicketIds: vi.fn(),
        shouldRedirectToSplitView: false,
        setShouldRedirectToSplitView: vi.fn(),
    },
    dtpEnabled: {
        isEnabled: true,
    },
    humanizeChannel: vi.fn((channelIdentifier) => String(channelIdentifier)),
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
            onToggleUnread: mergedOptions.onToggleUnread,
            handleTicketDraft: mergedOptions.handleTicketDraft,
            dtpToggle: mergedOptions.dtpToggle,
            dtpEnabled: mergedOptions.dtpEnabled,
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
