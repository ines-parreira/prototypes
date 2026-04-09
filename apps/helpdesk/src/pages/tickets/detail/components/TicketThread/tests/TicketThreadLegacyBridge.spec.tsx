import type { ReactNode } from 'react'

import type { TicketThreadAiAgentDraftMessageParams } from '@repo/ticket-thread/legacy-bridge'
import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'
import { render, screen } from '@testing-library/react'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'

import { TicketThreadAiAgentDraftMessage } from '../TicketThreadAiAgentDraftMessage'
import { TicketThreadLegacyBridge } from '../TicketThreadLegacyBridge'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket')
jest.mock('pages/tickets/detail/hooks/useRuleSuggestionForDemos')
jest.mock('../useInstagramCommentActions', () => ({
    useInstagramCommentActions: jest.fn(() => ({
        privateReplyData: null,
        handlePrivateReply: jest.fn(),
        handlePrivateReplyToggle: jest.fn(),
        handleHideComment: jest.fn(),
    })),
}))
jest.mock('../useFacebookCommentActions', () => ({
    useFacebookCommentActions: jest.fn(() => ({
        privateReplyData: null,
        handlePrivateReply: jest.fn(),
        handlePrivateReplyToggle: jest.fn(),
        handleHideComment: jest.fn(),
        handleLike: jest.fn(),
    })),
}))
jest.mock('../CommentPrivateReplyModal', () => ({
    CommentPrivateReplyModal: () => <div>CommentPrivateReplyModal</div>,
}))
jest.mock('../TicketThreadAiAgentReasoning', () => ({
    TicketThreadAiAgentReasoning: jest.fn(() => (
        <div>AiAgentReasoningSlot</div>
    )),
}))
jest.mock('../TicketThreadAiAgentDraftMessage', () => ({
    TicketThreadAiAgentDraftMessage: jest.fn(() => (
        <div>AiAgentDraftMessageSlot</div>
    )),
}))
jest.mock('@repo/ticket-thread/legacy-bridge', () => ({
    TicketThreadLegacyBridgeProvider: jest.fn(
        ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    ),
}))

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseFetchInfluencedOrdersForCurrentTicket =
    useFetchInfluencedOrdersForCurrentTicket as jest.Mock
const mockUseRuleSuggestionForDemos = useRuleSuggestionForDemos as jest.Mock
const mockTicketThreadLegacyBridgeProvider =
    TicketThreadLegacyBridgeProvider as jest.Mock
const mockTicketThreadAiAgentDraftMessage =
    TicketThreadAiAgentDraftMessage as jest.Mock

describe('TicketThreadLegacyBridge', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockUseAppSelector.mockReturnValue(false)
        mockUseFetchInfluencedOrdersForCurrentTicket.mockReturnValue({
            influencedOrders: {
                data: [],
            },
            ticketContext: {
                orders: [],
                shopifyIntegrations: [],
                ticketId: 1,
            },
        })
        mockUseRuleSuggestionForDemos.mockReturnValue({
            shouldDisplayDemoSuggestion: false,
        })
    })

    it('registers the AI agent draft bridge renderer on the legacy bridge provider', () => {
        render(
            <TicketThreadLegacyBridge>
                <div>Ticket thread child</div>
            </TicketThreadLegacyBridge>,
        )

        expect(screen.getByText('Ticket thread child')).toBeInTheDocument()

        const providerProps =
            mockTicketThreadLegacyBridgeProvider.mock.calls[0][0]

        expect(providerProps.renderAiAgentDraftMessage).toEqual(
            expect.any(Function),
        )

        render(
            providerProps.renderAiAgentDraftMessage({
                isTrial: false,
                message: {
                    id: 123,
                    ticket_id: 1,
                },
            } as TicketThreadAiAgentDraftMessageParams),
        )

        expect(screen.getByText('AiAgentDraftMessageSlot')).toBeInTheDocument()
        expect(mockTicketThreadAiAgentDraftMessage).toHaveBeenCalledWith(
            {
                isTrial: false,
                message: {
                    id: 123,
                    ticket_id: 1,
                },
            },
            expect.anything(),
        )
    })
})
