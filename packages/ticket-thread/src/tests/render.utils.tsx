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

import { ExpandedMessagesProvider } from '../contexts/ExpandedMessages'
import { TicketThreadLegacyBridgeProvider } from '../utils/LegacyBridge'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    LegacyBridgeActions,
    LegacyBridgeContextType,
    LegacyBridgeState,
} from '../utils/LegacyBridge/types'

export const createTestQueryClient = () =>
    new QueryClient({
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

export const testAppQueryClient = createTestQueryClient()

type LegacyBridgeOptions = {
    currentTicketShoppingAssistantData?: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData?: CurrentTicketRuleSuggestionData
    legacyActions?: LegacyBridgeActions
    legacyState?: LegacyBridgeState
    renderAiAgentReasoning?: LegacyBridgeContextType['renderAiAgentReasoning']
}

type RenderOptions = RenderOptionsPrimitive &
    LegacyBridgeOptions & {
        initialEntries?: string[]
        path?: string
        queryClient?: QueryClient
    }

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> &
    LegacyBridgeOptions & {
        initialEntries?: string[]
        path?: string
        queryClient?: QueryClient
    }

const defaultOptions = {
    initialEntries: ['/'],
    path: '/',
    currentTicketShoppingAssistantData: {
        influencedOrders: [],
        shopifyOrders: [],
        shopifyIntegrations: [],
    },
    currentTicketRuleSuggestionData: {
        shouldDisplayDemoSuggestion: true,
    },
    legacyActions: {
        deleteTicketPendingMessage: () => undefined,
        retrySubmitTicketMessage: () => undefined,
    },
    legacyState: {
        newMessage: {
            isSubmittingMessage: false,
        },
    },
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }

    const queryClient = options?.queryClient ?? testAppQueryClient
    const user = userEvent.setup()
    const legacyBridgeProps = {
        currentTicketShoppingAssistantData:
            mergedOptions.currentTicketShoppingAssistantData ??
            defaultOptions.currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData:
            mergedOptions.currentTicketRuleSuggestionData ??
            defaultOptions.currentTicketRuleSuggestionData,
        legacyActions:
            mergedOptions.legacyActions ?? defaultOptions.legacyActions,
        legacyState: mergedOptions.legacyState ?? defaultOptions.legacyState,
        renderAiAgentReasoning: mergedOptions.renderAiAgentReasoning,
    }

    const result = renderPrimitive(element, {
        ...options,
        wrapper: ({ children }) => (
            <TicketThreadLegacyBridgeProvider {...legacyBridgeProps}>
                <ExpandedMessagesProvider>
                    <QueryClientProvider client={queryClient}>
                        <MemoryRouter
                            initialEntries={mergedOptions.initialEntries}
                        >
                            <Route path={mergedOptions.path}>{children}</Route>
                        </MemoryRouter>
                    </QueryClientProvider>
                </ExpandedMessagesProvider>
            </TicketThreadLegacyBridgeProvider>
        ),
    })

    return {
        user,
        mocks: {},
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

    const queryClient = options?.queryClient ?? testAppQueryClient
    const legacyBridgeProps = {
        currentTicketShoppingAssistantData:
            mergedOptions.currentTicketShoppingAssistantData ??
            defaultOptions.currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData:
            mergedOptions.currentTicketRuleSuggestionData ??
            defaultOptions.currentTicketRuleSuggestionData,
        legacyActions:
            mergedOptions.legacyActions ?? defaultOptions.legacyActions,
        legacyState: mergedOptions.legacyState ?? defaultOptions.legacyState,
        renderAiAgentReasoning: mergedOptions.renderAiAgentReasoning,
    }

    return renderHookPrimitive(hook, {
        ...options,
        wrapper: ({ children }) => (
            <TicketThreadLegacyBridgeProvider {...legacyBridgeProps}>
                <ExpandedMessagesProvider>
                    <QueryClientProvider client={queryClient}>
                        <MemoryRouter
                            initialEntries={mergedOptions.initialEntries}
                        >
                            <Route path={mergedOptions.path}>{children}</Route>
                        </MemoryRouter>
                    </QueryClientProvider>
                </ExpandedMessagesProvider>
            </TicketThreadLegacyBridgeProvider>
        ),
    })
}
