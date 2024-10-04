import {render} from '@testing-library/react'
import React from 'react'

// import useAppDispatch from 'hooks/useAppDispatch'
import useAiAgentMessageFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback'

import useHasAIAgent from '../hooks/useHasAIAgent'
import useHasAutoQA from '../hooks/useHasAutoQA'

import TicketFeedback from '../TicketFeedback'

jest.mock('auto_qa', () => ({AutoQA: () => <div>AutoQA</div>}))
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar',
    () => () => <div>AIAgentFeedbackBar</div>
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback',
    () => jest.fn()
)
const useAiAgentMessageFeedbackMock = useAiAgentMessageFeedback as jest.Mock

jest.mock('../hooks/useHasAIAgent', () => jest.fn())
const useHasAIAgentMock = useHasAIAgent as jest.Mock

jest.mock('../hooks/useHasAutoQA', () => jest.fn())
const useHasAutoQAMock = useHasAutoQA as jest.Mock

describe('TicketFeedback', () => {
    beforeEach(() => {
        useAiAgentMessageFeedbackMock.mockReturnValue(null)
        useHasAIAgentMock.mockReturnValue(false)
        useHasAutoQAMock.mockReturnValue(false)
    })

    it('should render an unauthorised message if neither AutoQA nor Agent AI are active', () => {
        const {getByText} = render(<TicketFeedback />)
        expect(getByText('Unauthorized')).toBeInTheDocument()
        expect(
            getByText('You do not have permission to view ticket feedback.')
        ).toBeInTheDocument()
    })

    it('should render AutoQA if it is active', () => {
        useHasAutoQAMock.mockReturnValue(true)
        const {getByText} = render(<TicketFeedback />)
        expect(getByText('AutoQA')).toBeInTheDocument()
    })

    it('should render AI Agent if it is active', () => {
        useHasAIAgentMock.mockReturnValue(true)
        const {getByText} = render(<TicketFeedback />)
        expect(getByText('AIAgentFeedbackBar')).toBeInTheDocument()
    })

    it('should render a separator if both AutoQA and AI Agent are active', () => {
        useHasAutoQAMock.mockReturnValue(true)
        useHasAIAgentMock.mockReturnValue(true)
        const {container} = render(<TicketFeedback />)
        expect(container.children[0].children.length).toBe(3)
    })

    it('should render a back button when a message is selected', () => {
        useAiAgentMessageFeedbackMock.mockReturnValue({messageId: 1})
        useHasAutoQAMock.mockReturnValue(true)
        const {getByText} = render(<TicketFeedback />)
        expect(getByText('Back')).toBeInTheDocument()
    })
})
