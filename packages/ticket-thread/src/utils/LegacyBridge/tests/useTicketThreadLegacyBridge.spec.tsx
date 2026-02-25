import type { ReactNode } from 'react'

import { render, renderHook, screen } from '@testing-library/react'

import { TicketThreadLegacyBridgeProvider } from '../TicketThreadLegacyBridgeProvider'
import type { CurrentTicketShoppingAssistantData } from '../types'
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

const wrapper = ({ children }: { children: ReactNode }) => (
    <TicketThreadLegacyBridgeProvider
        currentTicketShoppingAssistantData={currentTicketShoppingAssistantData}
        currentTicketRuleSuggestionData={{ shouldDisplayDemoSuggestion: false }}
    >
        {children}
    </TicketThreadLegacyBridgeProvider>
)

describe('useTicketThreadLegacyBridge', () => {
    it('throws when used outside of TicketThreadLegacyBridgeProvider', () => {
        const originalError = console.error
        console.error = vi.fn()

        expect(() => {
            renderHook(() => useTicketThreadLegacyBridge())
        }).toThrow(
            'useTicketThreadLegacyBridge must be used within TicketThreadLegacyBridgeProvider',
        )

        console.error = originalError
    })

    it('returns legacy bridge data from the provider', () => {
        const { result } = renderHook(() => useTicketThreadLegacyBridge(), {
            wrapper,
        })

        expect(result.current.currentTicketShoppingAssistantData).toEqual(
            currentTicketShoppingAssistantData,
        )
        expect(
            result.current.currentTicketRuleSuggestionData
                .shouldDisplayDemoSuggestion,
        ).toBe(false)
    })
})

describe('TicketThreadLegacyBridgeProvider', () => {
    it('renders its children', () => {
        render(
            <TicketThreadLegacyBridgeProvider
                currentTicketShoppingAssistantData={
                    currentTicketShoppingAssistantData
                }
            >
                <span>legacy child</span>
            </TicketThreadLegacyBridgeProvider>,
        )

        expect(screen.getByText('legacy child')).toBeInTheDocument()
    })
})
