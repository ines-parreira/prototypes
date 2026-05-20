import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockGetUserAvailabilityHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
    mockTicketMessageUserOrCustomer,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { AI_AGENT_BOT_EMAILS } from '../../../hooks/messages/constants'
import type { TicketThreadAiAgentHandoverMessageItem } from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type { DisplayedTicketThreadMessageItem } from '../../TicketMessage/hooks/useDisplayedTicketMessage'
import { AiAgentHandoverSummaryMessage } from './AiAgentHandoverSummaryMessage'

const MESSAGE_DATETIME = '2024-03-21T11:00:00Z'
const mockUseDisplayedTicketMessage = vi.fn()

vi.mock('../../TicketMessage/hooks/useDisplayedTicketMessage', () => ({
    useDisplayedTicketMessage: (args: {
        item: TicketThreadAiAgentHandoverMessageItem
    }) => mockUseDisplayedTicketMessage(args),
}))

vi.mock('../../MessageBubble/components/MessageFooter', () => ({
    MessageFooter: () => <div>MessageFooter</div>,
}))

const aiAgentSender: TicketThreadAiAgentHandoverMessageItem['data']['sender'] =
    {
        ...mockTicketMessageUserOrCustomer({
            id: 1,
            name: 'Support Copilot',
            email: AI_AGENT_BOT_EMAILS[0],
            meta: null,
        }),
        id: 1,
        name: 'Support Copilot',
        email: AI_AGENT_BOT_EMAILS[0],
        meta: null,
    }

const handoverActions: TicketThreadAiAgentHandoverMessageItem['data']['actions'] =
    [
        {
            name: 'addTags',
            arguments: { tags: 'ai_handover' },
        },
    ]

function createHandoverMessageItem(
    overrides: Partial<TicketThreadAiAgentHandoverMessageItem['data']> = {},
): TicketThreadAiAgentHandoverMessageItem {
    const sender = overrides.sender ?? aiAgentSender

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentHandoverMessage,
        data: {
            ...mockTicketMessage({
                id: 1,
                body_text: 'Handing over to a human agent',
                stripped_text: 'Handing over to a human agent',
                body_html: null,
                stripped_html: null,
            }),
            ...overrides,
            sender,
            actions: overrides.actions ?? handoverActions,
            channel: overrides.channel ?? 'email',
        },
        datetime: MESSAGE_DATETIME,
    }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

beforeEach(() => {
    mockUseDisplayedTicketMessage.mockReset()
    mockUseDisplayedTicketMessage.mockImplementation(({ item }) => item)
    server.use(
        getCurrentUserHandler().handler,
        http.get('*/api/users/:id', () => HttpResponse.json(mockUser())),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetCustomerHandler().handler,
        mockGetUserAvailabilityHandler().handler,
    )
    window.GORGIAS_STATE = { currentAccount: { domain: 'acme' } }
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

describe('AiAgentHandoverSummaryMessage', () => {
    it('renders the AI agent sender name from the message', () => {
        render(
            <AiAgentHandoverSummaryMessage
                item={createHandoverMessageItem()}
            />,
        )

        expect(screen.getByText('Support Copilot')).toBeInTheDocument()
    })

    it('falls back to "AI Agent" when sender name is empty', () => {
        const item = createHandoverMessageItem({
            sender: { ...aiAgentSender, name: '' },
        })

        render(<AiAgentHandoverSummaryMessage item={item} />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('renders the message body text', () => {
        render(
            <AiAgentHandoverSummaryMessage
                item={createHandoverMessageItem()}
            />,
        )

        expect(
            screen.getByText('Handing over to a human agent'),
        ).toBeInTheDocument()
    })

    it('renders the displayed handover message body', () => {
        const item = createHandoverMessageItem()
        const displayedItem: DisplayedTicketThreadMessageItem<TicketThreadAiAgentHandoverMessageItem> =
            {
                ...item,
                data: {
                    ...item.data,
                    translations: {
                        ...mockTicketMessageTranslation({
                            ticket_message_id: item.data.id,
                        }),
                        stripped_html: null,
                        stripped_text:
                            'Overdragen aan een menselijke medewerker',
                    },
                },
            }
        mockUseDisplayedTicketMessage.mockReturnValue(displayedItem)

        render(<AiAgentHandoverSummaryMessage item={item} />)

        expect(mockUseDisplayedTicketMessage).toHaveBeenCalledWith({ item })
        expect(
            screen.getByText('Overdragen aan een menselijke medewerker'),
        ).toBeInTheDocument()
        expect(screen.getByText('MessageFooter')).toBeInTheDocument()
    })

    it('does not render a handover summary section when no legacy bridge callback is provided', () => {
        render(
            <AiAgentHandoverSummaryMessage
                item={createHandoverMessageItem()}
            />,
        )

        expect(
            screen.queryByText('Handover summary slot'),
        ).not.toBeInTheDocument()
    })

    it('renders the handover summary section when renderAiAgentHandoverSummary is provided via legacy bridge', () => {
        const renderAiAgentHandoverSummary = vi.fn(() => (
            <div>Handover summary slot</div>
        ))

        render(
            <AiAgentHandoverSummaryMessage
                item={createHandoverMessageItem()}
            />,
            { renderAiAgentHandoverSummary },
        )

        expect(screen.getByText('Handover summary slot')).toBeInTheDocument()
    })

    it('passes the message data to renderAiAgentHandoverSummary', () => {
        const renderAiAgentHandoverSummary = vi.fn(() => null)
        const item = createHandoverMessageItem()

        render(<AiAgentHandoverSummaryMessage item={item} />, {
            renderAiAgentHandoverSummary,
        })

        expect(renderAiAgentHandoverSummary).toHaveBeenCalledWith({
            message: item.data,
        })
    })
})
