import {
    renderHook as renderHookPrimitive,
    screen,
} from '@testing-library/react'

import { render, renderHook } from '../../../tests/render.utils'
import { TicketThreadLegacyBridgeProvider } from '../TicketThreadLegacyBridgeProvider'
import type {
    CurrentTicketShoppingAssistantData,
    LegacyBridgeActions,
    LegacyBridgeContextType,
} from '../types'
import { useTicketThreadLegacyBridge } from '../useTicketThreadLegacyBridge'

const currentTicketShoppingAssistantData: CurrentTicketShoppingAssistantData = {
    influencedOrders: [
        {
            id: 1001,
            integrationId: 42,
            ticketId: 777,
            createdDatetime: '2024-01-01T11:00:00Z',
            source: 'shopping-assistant',
        },
        {
            id: 1002,
            integrationId: 42,
            ticketId: 777,
            createdDatetime: '2024-01-02T11:00:00Z',
            source: null,
        },
    ],
    shopifyOrders: [
        {
            id: 1001,
            order_number: 2001,
        },
        {
            id: 1002,
            order_number: 2002,
            created_at: '2024-01-02T11:00:00Z',
            updated_at: '2024-01-03T11:00:00Z',
        },
    ],
    shopifyIntegrations: [
        {
            id: 42,
            name: 'Primary shop',
        },
    ],
}

const legacyActions: LegacyBridgeActions = {
    deleteTicketPendingMessage: vi.fn(),
    retrySubmitTicketMessage: vi.fn(),
}

const legacyState = {
    newMessage: {
        isSubmittingMessage: true,
    },
}

const renderAiAgentReasoning: LegacyBridgeContextType['renderAiAgentReasoning'] =
    vi.fn(() => <span>reasoning slot</span>)

describe('useTicketThreadLegacyBridge', () => {
    it('throws when used outside of TicketThreadLegacyBridgeProvider', () => {
        const originalError = console.error
        console.error = vi.fn()

        expect(() => {
            renderHookPrimitive(() => useTicketThreadLegacyBridge())
        }).toThrow(
            'useTicketThreadLegacyBridge must be used within TicketThreadLegacyBridgeProvider',
        )

        console.error = originalError
    })

    it('returns legacy bridge data from the provider', () => {
        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            currentTicketShoppingAssistantData,
            currentTicketRuleSuggestionData: {
                shouldDisplayDemoSuggestion: false,
            },
            legacyActions,
            legacyState,
            renderAiAgentReasoning,
        })

        expect(result.current.currentTicketShoppingAssistantData).toEqual(
            currentTicketShoppingAssistantData,
        )
        expect(
            result.current.currentTicketRuleSuggestionData
                .shouldDisplayDemoSuggestion,
        ).toBe(false)
        expect(result.current.legacyActions).toBe(legacyActions)
        expect(result.current.legacyState).toBe(legacyState)
        expect(result.current.renderAiAgentReasoning).toBe(
            renderAiAgentReasoning,
        )
    })
})

describe('TicketThreadLegacyBridgeProvider', () => {
    it('renders its children', () => {
        render(
            <TicketThreadLegacyBridgeProvider
                currentTicketShoppingAssistantData={
                    currentTicketShoppingAssistantData
                }
                currentTicketRuleSuggestionData={{
                    shouldDisplayDemoSuggestion: false,
                }}
                legacyActions={legacyActions}
                legacyState={legacyState}
                renderAiAgentReasoning={renderAiAgentReasoning}
            >
                <span>legacy child</span>
            </TicketThreadLegacyBridgeProvider>,
        )

        expect(screen.getByText('legacy child')).toBeInTheDocument()
    })
})
