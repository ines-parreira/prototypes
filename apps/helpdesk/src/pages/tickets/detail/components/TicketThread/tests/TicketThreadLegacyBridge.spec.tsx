import type { ReactNode } from 'react'

import type {
    TicketThreadAiAgentDraftMessageParams,
    TicketThreadAiAgentTrialMessageParams,
} from '@repo/ticket-thread/legacy-bridge'
import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'
import { render, screen } from '@testing-library/react'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'

import { TicketThreadAiAgentDraftMessage } from '../TicketThreadAiAgentDraftMessage'
import { TicketThreadAiAgentTrialMessage } from '../TicketThreadAiAgentTrialMessage'
import { TicketThreadLegacyBridge } from '../TicketThreadLegacyBridge'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket')
jest.mock('pages/tickets/detail/hooks/useRuleSuggestionForDemos')
jest.mock('services/pendingMessageManager/pendingMessageManager', () => ({
    __esModule: true,
    default: {
        pendingSendMessagesArgs: null,
        timeoutId: null,
        undoMessage: jest.fn(),
    },
}))
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
jest.mock('../TicketThreadAiAgentTrialMessage', () => ({
    TicketThreadAiAgentTrialMessage: jest.fn(() => (
        <div>AiAgentTrialMessageSlot</div>
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
const mockPendingMessageManager = pendingMessageManager as jest.Mocked<
    typeof pendingMessageManager
>
const mockTicketThreadLegacyBridgeProvider =
    TicketThreadLegacyBridgeProvider as jest.Mock
const mockTicketThreadAiAgentDraftMessage =
    TicketThreadAiAgentDraftMessage as jest.Mock
const mockTicketThreadAiAgentTrialMessage =
    TicketThreadAiAgentTrialMessage as jest.Mock

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
        mockPendingMessageManager.pendingSendMessagesArgs = null
        mockPendingMessageManager.timeoutId = null
        mockPendingMessageManager.undoMessage.mockReset()
    })

    it('passes Shopping Assistant bridge data through to the ticket-thread provider', () => {
        mockUseFetchInfluencedOrdersForCurrentTicket.mockReturnValue({
            influencedOrders: {
                data: [
                    {
                        id: 1001,
                        integrationId: 42,
                        ticketId: 1,
                        createdDatetime: '2024-01-01T11:00:00Z',
                        source: 'shopping-assistant',
                    },
                ],
            },
            ticketContext: {
                orders: [{ id: 1001, order_number: 3001 }],
                shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
                ticketId: 1,
            },
        })

        render(
            <TicketThreadLegacyBridge>
                <div>Ticket thread child</div>
            </TicketThreadLegacyBridge>,
        )

        const providerProps =
            mockTicketThreadLegacyBridgeProvider.mock.calls[0][0]

        expect(providerProps.currentTicketShoppingAssistantData).toEqual({
            influencedOrders: [
                {
                    id: 1001,
                    integrationId: 42,
                    ticketId: 1,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    source: 'shopping-assistant',
                },
            ],
            shopifyOrders: [{ id: 1001, order_number: 3001 }],
            shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
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
                message: {
                    id: 123,
                    ticket_id: 1,
                },
            } as TicketThreadAiAgentDraftMessageParams),
        )

        expect(screen.getByText('AiAgentDraftMessageSlot')).toBeInTheDocument()
        expect(mockTicketThreadAiAgentDraftMessage).toHaveBeenCalledWith(
            {
                message: {
                    id: 123,
                    ticket_id: 1,
                },
            },
            expect.anything(),
        )
    })

    it('registers the AI agent trial bridge renderer on the legacy bridge provider', () => {
        render(
            <TicketThreadLegacyBridge>
                <div>Ticket thread child</div>
            </TicketThreadLegacyBridge>,
        )

        const providerProps =
            mockTicketThreadLegacyBridgeProvider.mock.calls[0][0]

        expect(providerProps.renderAiAgentTrialMessage).toEqual(
            expect.any(Function),
        )

        render(
            providerProps.renderAiAgentTrialMessage({
                message: {
                    id: 456,
                    ticket_id: 2,
                },
            } as TicketThreadAiAgentTrialMessageParams),
        )

        expect(screen.getByText('AiAgentTrialMessageSlot')).toBeInTheDocument()
        expect(mockTicketThreadAiAgentTrialMessage).toHaveBeenCalledWith(
            {
                message: {
                    id: 456,
                    ticket_id: 2,
                },
            },
            expect.anything(),
        )
    })

    it('undoes the current pending message when the bridge receives the active message id', () => {
        mockPendingMessageManager.pendingSendMessagesArgs = {
            messageId: 123,
        } as never
        mockPendingMessageManager.timeoutId = 1 as never

        render(
            <TicketThreadLegacyBridge>
                <div>Ticket thread child</div>
            </TicketThreadLegacyBridge>,
        )

        const providerProps =
            mockTicketThreadLegacyBridgeProvider.mock.calls[0][0]
        const message = {
            _internal: {
                id: 123,
            },
        }

        expect(
            providerProps.legacyState.newMessage.canUndoTicketPendingMessage(
                message,
            ),
        ).toBe(true)

        providerProps.legacyActions.undoTicketPendingMessage(message)

        expect(mockPendingMessageManager.undoMessage).toHaveBeenCalledTimes(1)
    })

    it('does not undo a pending message when the ids do not match', () => {
        mockPendingMessageManager.pendingSendMessagesArgs = {
            messageId: 456,
        } as never
        mockPendingMessageManager.timeoutId = 1 as never

        render(
            <TicketThreadLegacyBridge>
                <div>Ticket thread child</div>
            </TicketThreadLegacyBridge>,
        )

        const providerProps =
            mockTicketThreadLegacyBridgeProvider.mock.calls[0][0]
        const message = {
            _internal: {
                id: 123,
            },
        }

        expect(
            providerProps.legacyState.newMessage.canUndoTicketPendingMessage(
                message,
            ),
        ).toBe(false)

        providerProps.legacyActions.undoTicketPendingMessage(message)

        expect(mockPendingMessageManager.undoMessage).not.toHaveBeenCalled()
    })
})
