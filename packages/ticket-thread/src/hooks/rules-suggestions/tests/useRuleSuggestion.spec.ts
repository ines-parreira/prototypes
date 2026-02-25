import { renderHook } from '@testing-library/react'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { useListTicketMessages } from '../../shared/useListTicketMessages'
import { TicketThreadItemTag } from '../../types'
import { useRuleSuggestion } from '../useRuleSuggestion'

vi.mock('@gorgias/helpdesk-queries', () => ({
    TicketVia: { Rule: 'rule' },
    useGetTicket: vi.fn(),
}))

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

vi.mock('../../shared/useListTicketMessages', () => ({
    useListTicketMessages: vi.fn(),
}))

const mockUseGetTicket = vi.mocked(useGetTicket)
const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)
const mockUseListTicketMessages = vi.mocked(useListTicketMessages)

describe('useRuleSuggestion', () => {
    beforeEach(() => {
        mockUseTicketThreadLegacyBridge.mockReturnValue({
            currentTicketShoppingAssistantData: {
                influencedOrders: [],
                shopifyOrders: [],
                shopifyIntegrations: [],
            },
            currentTicketRuleSuggestionData: {
                shouldDisplayDemoSuggestion: true,
            },
        })
        mockUseListTicketMessages.mockReturnValue([])
    })

    it('inserts a rule suggestion when legacy filters allow rendering', () => {
        mockUseGetTicket.mockReturnValue({
            data: {
                meta: {
                    rule_suggestion: {
                        actions: [
                            {
                                name: 'setStatus',
                                args: { status: 'open' },
                            },
                        ],
                    },
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )
        const items = result.current.insertRuleSuggestion([])

        expect(items).toHaveLength(1)
        expect(items[0]).toMatchObject({
            _tag: TicketThreadItemTag.RuleSuggestion,
        })
    })

    it('does not insert a rule suggestion when demo display is disabled', () => {
        mockUseTicketThreadLegacyBridge.mockReturnValue({
            currentTicketShoppingAssistantData: {
                influencedOrders: [],
                shopifyOrders: [],
                shopifyIntegrations: [],
            },
            currentTicketRuleSuggestionData: {
                shouldDisplayDemoSuggestion: false,
            },
        })
        mockUseGetTicket.mockReturnValue({
            data: {
                meta: {
                    rule_suggestion: {
                        actions: [
                            {
                                name: 'setStatus',
                                args: { status: 'open' },
                            },
                        ],
                    },
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )
        const items = result.current.insertRuleSuggestion([])

        expect(items).toEqual([])
    })

    it('does not insert a rule suggestion when a message already has rule_suggestion_slug', () => {
        mockUseListTicketMessages.mockReturnValue([
            {
                meta: {
                    rule_suggestion_slug: 'existing-suggestion',
                },
            } as any,
        ])
        mockUseGetTicket.mockReturnValue({
            data: {
                meta: {
                    rule_suggestion: {
                        actions: [
                            {
                                name: 'setStatus',
                                args: { status: 'open' },
                            },
                        ],
                    },
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )
        const items = result.current.insertRuleSuggestion([])

        expect(items).toEqual([])
    })

    it.skip('does not insert a rule suggestion when pending/failed/active pending messages already have rule_suggestion_slug', () => {
        // TODO: implement when pending/failed/active-pending messages are
        // explicitly wired into the rule-suggestion insertion flow.
        // Legacy parity target: apps/helpdesk/src/state/ticket/selectors.ts#getBody
    })
})
