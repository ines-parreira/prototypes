import {render, screen} from '@testing-library/react'
import React from 'react'

import {TicketMessage} from 'models/ticket/types'

import {useAIAgentMessageEvents} from '../../../hooks/useAIAgentMessageEvents'
import {TicketEventEnum} from '../../AIAgentFeedbackBar/types'
import AIAgentMessageEvents from '../AIAgentMessageEvents'

jest.mock('../../../hooks/useAIAgentMessageEvents')
const mockedUseAIAgentMessageEvents = useAIAgentMessageEvents as jest.Mock

const message = {
    actions: [],
    tags: [],
} as unknown as TicketMessage

describe('AIAgentMessageEvents', () => {
    beforeEach(() => {
        mockedUseAIAgentMessageEvents.mockReturnValue([
            {
                tags: [],
                action: null,
            },
        ])
    })

    it('does not render tagged event when tags are not present, nor action if not action is present', () => {
        render(<AIAgentMessageEvents message={message} />)
        expect(screen.queryByText('Tagged')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('ai-agent-message-action')
        ).not.toBeInTheDocument()
    })
    it('renders tagged event when tags are present', () => {
        mockedUseAIAgentMessageEvents.mockReturnValue([
            {
                tags: [{name: 'tag1'}, {name: 'tag2'}],
                action: null,
            },
        ])

        render(<AIAgentMessageEvents message={message} />)
        expect(screen.getByText('Tagged')).toBeInTheDocument()
    })
    it('renders action event when action is present', () => {
        mockedUseAIAgentMessageEvents.mockReturnValue([
            {
                tags: [],
                action: TicketEventEnum.CLOSE,
            },
        ])
        render(<AIAgentMessageEvents message={message} />)

        expect(
            screen.getByTestId('ai-agent-message-action')
        ).toBeInTheDocument()
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })
})
