import type { ReactElement, ReactNode } from 'react'

import {
    renderHook as renderHookPrimitive,
    render as renderPrimitive,
} from '@repo/testing/vitest'
import type {
    RenderHookOptions as RenderHookOptionsPrimitive,
    RenderOptions as RenderOptionsPrimitive,
} from '@testing-library/react'

import { ExpandedMessagesProvider } from '../contexts/ExpandedMessages'
import { TicketThreadLegacyBridgeProvider } from '../utils/LegacyBridge'
import type {
    CurrentTicketRuleSuggestionData,
    CurrentTicketShoppingAssistantData,
    LegacyBridgeActions,
    LegacyBridgeContextType,
    LegacyBridgeState,
    VoiceCallBridgeCallbacks,
} from '../utils/LegacyBridge/types'

type LegacyBridgeOptions = {
    currentTicketShoppingAssistantData?: CurrentTicketShoppingAssistantData
    currentTicketRuleSuggestionData?: CurrentTicketRuleSuggestionData
    legacyActions?: LegacyBridgeActions
    legacyState?: LegacyBridgeState
    renderAiAgentDraftMessage?: LegacyBridgeContextType['renderAiAgentDraftMessage']
    renderAiAgentTrialMessage?: LegacyBridgeContextType['renderAiAgentTrialMessage']
    renderAiAgentReasoning?: LegacyBridgeContextType['renderAiAgentReasoning']
    voiceCallCallbacks?: VoiceCallBridgeCallbacks
}

type RenderOptions = Omit<RenderOptionsPrimitive, 'wrapper'> &
    LegacyBridgeOptions & {
        initialEntries?: string[]
        path?: string
        wrapper?: RenderOptionsPrimitive['wrapper']
    }

type RenderHookOptions<TProps> = RenderHookOptionsPrimitive<TProps> &
    LegacyBridgeOptions & {
        initialEntries?: string[]
        path?: string
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
        undoTicketPendingMessage: () => undefined,
    },
    legacyState: {
        newMessage: {
            isSubmittingMessage: false,
            canUndoTicketPendingMessage: () => false,
        },
    },
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }
    const {
        initialEntries,
        path,
        currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData,
        legacyActions,
        legacyState,
        renderAiAgentDraftMessage,
        renderAiAgentTrialMessage,
        renderAiAgentReasoning,
        voiceCallCallbacks,
        wrapper: ExtraWrapper,
        ...renderOptions
    } = mergedOptions
    const legacyBridgeProps = {
        currentTicketShoppingAssistantData:
            currentTicketShoppingAssistantData ??
            defaultOptions.currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData:
            currentTicketRuleSuggestionData ??
            defaultOptions.currentTicketRuleSuggestionData,
        legacyActions: legacyActions ?? defaultOptions.legacyActions,
        legacyState: legacyState ?? defaultOptions.legacyState,
        renderAiAgentDraftMessage,
        renderAiAgentTrialMessage,
        renderAiAgentReasoning,
        voiceCallCallbacks,
        onInstagramCommentPrivateReply: () => undefined,
        onInstagramCommentHideComment: () => undefined,
        onFacebookCommentPrivateReply: () => undefined,
        onFacebookCommentHideComment: () => undefined,
        onFacebookCommentLike: () => undefined,
    }

    const { user, ...result } = renderPrimitive(element, {
        ...renderOptions,
        initialEntries,
        path,
        wrapper: ({ children }: { children: ReactNode }) => (
            <TicketThreadLegacyBridgeProvider {...legacyBridgeProps}>
                <ExpandedMessagesProvider>
                    {ExtraWrapper ? (
                        <ExtraWrapper>{children as ReactElement}</ExtraWrapper>
                    ) : (
                        children
                    )}
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
    const {
        initialEntries,
        path,
        currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData,
        legacyActions,
        legacyState,
        renderAiAgentDraftMessage,
        renderAiAgentTrialMessage,
        renderAiAgentReasoning,
        voiceCallCallbacks,
        wrapper: ExtraWrapper,
        ...renderHookOptions
    } = mergedOptions
    const legacyBridgeProps = {
        currentTicketShoppingAssistantData:
            currentTicketShoppingAssistantData ??
            defaultOptions.currentTicketShoppingAssistantData,
        currentTicketRuleSuggestionData:
            currentTicketRuleSuggestionData ??
            defaultOptions.currentTicketRuleSuggestionData,
        legacyActions: legacyActions ?? defaultOptions.legacyActions,
        legacyState: legacyState ?? defaultOptions.legacyState,
        renderAiAgentDraftMessage,
        renderAiAgentTrialMessage,
        renderAiAgentReasoning,
        voiceCallCallbacks,
        onInstagramCommentPrivateReply: () => undefined,
        onInstagramCommentHideComment: () => undefined,
        onFacebookCommentPrivateReply: () => undefined,
        onFacebookCommentHideComment: () => undefined,
        onFacebookCommentLike: () => undefined,
    }

    const result = renderHookPrimitive(hook, {
        ...renderHookOptions,
        initialEntries,
        path,
        wrapper: ({ children }: { children: ReactNode }) => (
            <TicketThreadLegacyBridgeProvider {...legacyBridgeProps}>
                <ExpandedMessagesProvider>
                    {ExtraWrapper ? (
                        <ExtraWrapper>{children as ReactElement}</ExtraWrapper>
                    ) : (
                        children
                    )}
                </ExpandedMessagesProvider>
            </TicketThreadLegacyBridgeProvider>
        ),
    })
    return result
}
