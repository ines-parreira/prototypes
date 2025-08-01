import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import { TicketMessage } from 'models/ticket/types'
import { useAIAgentMessageEvents } from 'pages/tickets/detail/hooks/useAIAgentMessageEvents'

import FeedbackEvents from '../FeedbackEvents'
import { TicketEventEnum } from '../types'
import { messageFeedback } from './fixtures'

jest.mock('common/segment/segment')
jest.mock('pages/tickets/detail/hooks/useAIAgentMessageEvents')

const logEventMock = assumeMock(logEventWithSampling)
const useAIAgentMessageEventsMock = assumeMock(useAIAgentMessageEvents)

describe('FeedbackEvents', () => {
    const mockMessage = {
        ticket_id: 1,
        id: messageFeedback.messageId,
    } as unknown as TicketMessage
    const messages = [mockMessage]
    const shopType = 'exampleShopType'
    const shopName = 'exampleShopName'

    beforeEach(() => {
        useAIAgentMessageEventsMock.mockReturnValue([
            {
                action: TicketEventEnum.HANDOVER,
                tags: [],
            },
        ])
    })

    it('renders the correct number of TicketEvent components', () => {
        render(
            <FeedbackEvents
                messages={messages}
                shopType={shopType}
                shopName={shopName}
            />,
        )
        expect(screen.getByText('Ticket events')).toBeInTheDocument()
    })

    it('calls logEventWithSampling with the correct SegmentEvent', () => {
        render(
            <FeedbackEvents
                messages={messages}
                shopType={shopType}
                shopName={shopName}
            />,
        )
        const link = screen.getByText('AI Agent Configuration')
        userEvent.click(link)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentFeedbackResourceClicked,
            { type: 'ai_agent_configuration_link' },
        )
    })

    it('does not render TicketEvent components if there are no events', () => {
        useAIAgentMessageEventsMock.mockReturnValue([])
        render(
            <FeedbackEvents
                messages={messages}
                shopType={shopType}
                shopName={shopName}
            />,
        )
        expect(screen.queryByText('Ticket events')).not.toBeInTheDocument()
    })
})
