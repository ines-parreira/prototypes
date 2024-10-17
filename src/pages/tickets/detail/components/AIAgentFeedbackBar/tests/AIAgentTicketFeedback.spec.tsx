import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {Tag} from '@gorgias/api-queries'

import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {TicketFeedback} from 'models/aiAgentFeedback/types'
import {TicketMessage} from 'models/ticket/types'
import {useAIAgentMessageEvents} from 'pages/tickets/detail/hooks/useAIAgentMessageEvents'

import {TicketEventEnum} from '../types'
import AIAgentTicketFeedback from '../AIAgentTicketFeedback'
import {messageFeedback} from './fixtures'

jest.mock('state/ticket/selectors')
jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('pages/tickets/detail/hooks/useAIAgentMessageEvents')
jest.mock(
    '../TicketEvent',
    () =>
        ({
            children,
            isFirst,
            isLast,
            eventType,
        }: {
            children: React.ReactNode
            isFirst: boolean
            isLast: boolean
            eventType: TicketEventEnum
        }) => (
            <div
                data-testid="ticket-event"
                data-is-first={isFirst}
                data-is-last={isLast}
                data-event-type={eventType}
            >
                {children}
            </div>
        )
)

const getAIAgentMessagesMock = assumeMock(getAIAgentMessages)
const useAIAgentMessageEventsMock = assumeMock(useAIAgentMessageEvents)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const aiMessage = {
    id: messageFeedback.messageId,
    public: true,
} as TicketMessage

const ticketFeedback: TicketFeedback = {
    messages: [messageFeedback],
}

const store = mockStore({})

describe('AIAgentTicketFeedback', () => {
    beforeEach(() => {
        getAIAgentMessagesMock.mockReturnValue([aiMessage])
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                tags: [],
                action: null,
            },
        ])
    })

    it('should not render messages count', () => {
        getAIAgentMessagesMock.mockReturnValue([
            {
                ...aiMessage,
                public: false,
            },
        ])

        const {queryByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            </Provider>
        )

        expect(
            queryByTestId('ticket-feedback-messages')
        ).not.toBeInTheDocument()
    })

    it('should render messages count when aiMessage is public', () => {
        const {getByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            </Provider>
        )

        expect(getByTestId('ticket-feedback-messages')).toHaveTextContent(
            '1 message'
        )
    })

    it('should not render resource ("Using") section when no resources are used', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                guidance: [],
                                knowledge: [],
                                actions: [],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        expect(queryByText('Using')).not.toBeInTheDocument()
    })

    it('should render resource ("Using") section when there are guidances used', () => {
        const {queryByText, queryByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                knowledge: [],
                                actions: [],
                                guidance: [
                                    {
                                        id: 1,
                                        name: 'Cancelling an order',
                                    },
                                    {
                                        id: 2,
                                        name: 'How to make your cat do the laundry',
                                    },
                                ],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        expect(queryByText('Using')).toBeInTheDocument()
        expect(queryByTestId('ticket-feedback-guidances')).toHaveTextContent(
            /2 Guidances/
        )
    })

    it('should render resource ("Using") section when there are knowledges used', () => {
        const {queryByText, queryByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                guidance: [],
                                actions: [],
                                knowledge: [
                                    {
                                        type: 'article',
                                        id: 234,
                                        name: 'How To Order a Pizza',
                                    },
                                    {
                                        type: 'external_snippet',
                                        id: 235,
                                        name: 'Refund Policy for Aliens',
                                        url: 'https://artemis.gorgias.help/en-US#article-13609',
                                    },
                                ],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        expect(queryByText('Using')).toBeInTheDocument()
        expect(queryByTestId('ticket-feedback-knowledges')).toHaveTextContent(
            /2 Knowledge sources/
        )
    })

    it('should render resource ("Using") section when there are actions used', () => {
        const {queryByText, queryByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                guidance: [],
                                knowledge: [],
                                actions: [
                                    {
                                        id: 1,
                                        name: 'Snooze',
                                        type: 'soft_action',
                                    },
                                    {
                                        id: 2,
                                        name: 'Close',
                                        type: 'hard_action',
                                    },
                                ],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        expect(queryByText('Using')).toBeInTheDocument()
        expect(queryByTestId('ticket-feedback-actions')).toHaveTextContent(
            /2 Actions/
        )
    })

    it('should not render orders section when there are orders used', () => {
        const {queryByText, queryAllByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                orders: [],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        const orders = queryAllByTestId('ticket-feedback-order')

        expect(queryByText('Order Data')).not.toBeInTheDocument()
        expect(orders.length).toBe(0)
    })

    it('should render orders section when there are orders used', () => {
        const {queryByText, queryAllByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                orders: [
                                    {
                                        id: 3324,
                                        name: '#3324',
                                        url: 'https://gorgias.com',
                                    },
                                    {
                                        id: 3325,
                                        name: '#3325',
                                        url: 'https://gorgias.com',
                                    },
                                ],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        const orders = queryAllByTestId('ticket-feedback-order')

        expect(queryByText('Order')).toBeInTheDocument()
        expect(orders.length).toBe(2)
        expect(orders[0]).toHaveTextContent(/#3324/)
        expect(orders[1]).toHaveTextContent(/#3325/)
    })

    it('should not render event section when there are no events', () => {
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                tags: [],
                action: null,
            },
        ])

        const {queryByText} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback
                    ticketFeedback={{
                        ...ticketFeedback,
                        messages: [
                            {
                                ...messageFeedback,
                                actions: [],
                            },
                        ],
                    }}
                />
            </Provider>
        )

        expect(queryByText('Ticket events')).not.toBeInTheDocument()
    })

    it('should render event section when there are events', () => {
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                tags: [
                    {
                        id: 1,
                        name: 'Order',
                    },
                    {
                        id: 2,
                        name: 'Shipping',
                    },
                ] as Tag[],
                action: null,
            },
        ])
        const {queryByText} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            </Provider>
        )

        expect(queryByText('Ticket events')).toBeInTheDocument()
    })

    it('should render all events for multiple messages', () => {
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                tags: [
                    {
                        id: 1,
                        name: 'Order',
                    },
                    {
                        id: 2,
                        name: 'Shipping',
                    },
                ] as Tag[],
                action: null,
            },
            {
                tags: [
                    {
                        id: 3,
                        name: 'Refund',
                    },
                ] as Tag[],
                action: TicketEventEnum.CLOSE,
            },
            {
                tags: [],
                action: TicketEventEnum.SNOOZE,
            },
        ])
        const {queryByText, queryAllByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            </Provider>
        )

        const ticketEvents = queryAllByTestId('ticket-event')

        expect(queryByText('Ticket events')).toBeInTheDocument()
        expect(ticketEvents.length).toBe(4)

        expect(ticketEvents[0]).toHaveAttribute('data-is-first', 'true')
        expect(ticketEvents[0]).toHaveAttribute('data-is-last', 'false')
        expect(ticketEvents[0]).toHaveTextContent('OrderShipping')

        expect(ticketEvents[1]).toHaveAttribute('data-is-first', 'false')
        expect(ticketEvents[1]).toHaveAttribute('data-is-last', 'false')
        expect(ticketEvents[1]).toHaveTextContent('Refund')

        expect(ticketEvents[2]).toHaveAttribute('data-is-first', 'false')
        expect(ticketEvents[2]).toHaveAttribute('data-is-last', 'false')
        expect(ticketEvents[2]).toHaveAttribute('data-event-type', 'CLOSE')

        expect(ticketEvents[3]).toHaveAttribute('data-is-first', 'false')
        expect(ticketEvents[3]).toHaveAttribute('data-is-last', 'true')
        expect(ticketEvents[3]).toHaveAttribute('data-event-type', 'SNOOZE')
    })

    it('should render improve ticket actions links correctly', () => {
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                tags: [],
                action: TicketEventEnum.CLOSE,
            },
        ])
        const {queryByText, queryByTestId} = render(
            <Provider store={store}>
                <AIAgentTicketFeedback ticketFeedback={ticketFeedback} />
            </Provider>
        )

        expect(queryByText('Ticket events')).toBeInTheDocument()

        const ticketImproveInfo = queryByTestId('ticket-feedback-improve-info')

        expect(ticketImproveInfo).toBeInTheDocument()

        const links = ticketImproveInfo?.querySelectorAll('a')

        expect(links?.length).toBe(1)

        expect(links?.[0]).toHaveTextContent('AI Agent Configuration')
        expect(links?.[0]).toHaveAttribute(
            'href',
            '/app/automation/shopify/fast-cars/ai-agent'
        )
    })
})
