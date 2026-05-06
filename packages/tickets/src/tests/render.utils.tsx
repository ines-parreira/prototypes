import type { ReactElement, ReactNode } from 'react'

import {
    renderHook as renderHookPrimitive,
    render as renderPrimitive,
} from '@repo/testing/vitest'
import type {
    RenderHookOptions as RenderHookOptionsPrimitive,
    RenderOptions as RenderOptionsPrimitive,
} from '@testing-library/react'

import { TranslateTicketModalContext } from '../translations/context/TranslateTicketModalContext'
import { TicketsLegacyBridgeProvider } from '../utils/LegacyBridge'
import type { LegacyBridgeContextType } from '../utils/LegacyBridge/context'

type LegacyBridgeOptions = {
    ticketViewBreadcrumb?: LegacyBridgeContextType['ticketViewBreadcrumb']
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
    dispatchAuditLogEvents: vi.fn(),
    dispatchHideAuditLogEvents: vi.fn(),
    toggleQuickReplies: vi.fn(),
    onToggleUnread: vi.fn(),
    ticketViewBreadcrumb: null,
    ticketViewNavigation: {
        isSearchView: false,
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

export const mockTranslateTicketModalContextValue = {
    openTranslateTicketModal: vi.fn(),
}

export const render = (element: ReactElement, options?: RenderOptions) => {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    }
    const {
        initialEntries,
        path,
        ticketViewBreadcrumb,
        ticketViewNavigation,
        dispatchAuditLogEvents,
        dispatchHideAuditLogEvents,
        toggleQuickReplies,
        onToggleUnread,
        handleTicketDraft,
        makeOutboundCall,
        voiceDevice,
        dtpToggle,
        dtpEnabled,
        humanizeChannel,
        wrapper: ExtraWrapper,
        ...renderOptions
    } = mergedOptions

    const legacyBridgeOptions = {
        initialEntries,
        path,
        ticketViewBreadcrumb,
        ticketViewNavigation,
        dispatchAuditLogEvents,
        dispatchHideAuditLogEvents,
        toggleQuickReplies,
        onToggleUnread,
        handleTicketDraft,
        makeOutboundCall,
        voiceDevice,
        dtpToggle,
        dtpEnabled,
        humanizeChannel,
    }
    const { user, ...result } = renderPrimitive(element, {
        ...renderOptions,
        initialEntries,
        path,
        wrapper: ({ children }: { children: ReactNode }) => {
            const wrappedChildren = (
                <TicketsLegacyBridgeProvider {...legacyBridgeOptions}>
                    {ExtraWrapper ? (
                        <ExtraWrapper>{children as ReactElement}</ExtraWrapper>
                    ) : (
                        children
                    )}
                </TicketsLegacyBridgeProvider>
            )

            return (
                <TranslateTicketModalContext.Provider
                    value={mockTranslateTicketModalContextValue}
                >
                    {wrappedChildren}
                </TranslateTicketModalContext.Provider>
            )
        },
    })

    return {
        user,
        mocks: {
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
    const {
        initialEntries,
        path,
        ticketViewBreadcrumb,
        ticketViewNavigation,
        dispatchAuditLogEvents,
        dispatchHideAuditLogEvents,
        toggleQuickReplies,
        onToggleUnread,
        handleTicketDraft,
        makeOutboundCall,
        voiceDevice,
        dtpToggle,
        dtpEnabled,
        humanizeChannel,
        wrapper: ExtraWrapper,
        ...renderHookOptions
    } = mergedOptions

    const legacyBridgeOptions = {
        initialEntries,
        path,
        ticketViewBreadcrumb,
        ticketViewNavigation,
        dispatchAuditLogEvents,
        dispatchHideAuditLogEvents,
        toggleQuickReplies,
        onToggleUnread,
        handleTicketDraft,
        makeOutboundCall,
        voiceDevice,
        dtpToggle,
        dtpEnabled,
        humanizeChannel,
    }

    const result = renderHookPrimitive(hook, {
        ...renderHookOptions,
        initialEntries,
        path,
        wrapper: ({ children }: { children: ReactNode }) => {
            const wrappedChildren = (
                <TicketsLegacyBridgeProvider {...legacyBridgeOptions}>
                    {ExtraWrapper ? (
                        <ExtraWrapper>{children as ReactElement}</ExtraWrapper>
                    ) : (
                        children
                    )}
                </TicketsLegacyBridgeProvider>
            )

            return (
                <TranslateTicketModalContext.Provider
                    value={mockTranslateTicketModalContextValue}
                >
                    {wrappedChildren}
                </TranslateTicketModalContext.Provider>
            )
        },
    })
    return result
}
