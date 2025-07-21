import { render } from '@testing-library/react'

import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import useAiAgentMessageFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback'

import useHasAIAgent from '../hooks/useHasAIAgent'
import TicketFeedback from '../TicketFeedback'

jest.mock('auto_qa', () => ({ AutoQA: () => <div>AutoQA</div> }))
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar',
    () => () => <div>AIAgentFeedbackBar</div>,
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback',
    () => jest.fn(),
)
const useAiAgentMessageFeedbackMock = useAiAgentMessageFeedback as jest.Mock

jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')
const useTicketIsAfterFeedbackCollectionPeriodMock =
    useTicketIsAfterFeedbackCollectionPeriod as jest.Mock

jest.mock('../hooks/useHasAIAgent', () => jest.fn())
const useHasAIAgentMock = useHasAIAgent as jest.Mock

jest.mock('hooks/useHasAgentPrivileges', () => jest.fn())
const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.Mock

describe('TicketFeedback', () => {
    beforeEach(() => {
        useAiAgentMessageFeedbackMock.mockReturnValue(null)
        useHasAIAgentMock.mockReturnValue(false)
        useHasAgentPrivilegesMock.mockReturnValue(false)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(false)
    })

    it('should render an unauthorised message if neither AutoQA nor Agent AI are active', () => {
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('Unauthorized')).toBeInTheDocument()
        expect(
            getByText('You do not have permission to view ticket feedback.'),
        ).toBeInTheDocument()
    })

    it('should render AutoQA if it is active', () => {
        useHasAgentPrivilegesMock.mockReturnValue(true)
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('AutoQA')).toBeInTheDocument()
    })

    it('should render AI Agent if it is active', () => {
        useHasAIAgentMock.mockReturnValue(true)
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('AIAgentFeedbackBar')).toBeInTheDocument()
    })

    it('should render a separator if both AutoQA and AI Agent are active', () => {
        useHasAgentPrivilegesMock.mockReturnValue(true)
        useHasAIAgentMock.mockReturnValue(true)
        const { container } = render(<TicketFeedback />)
        expect(container.children[0].children.length).toBe(3)
    })

    it('should render a back button when a message is selected', () => {
        useAiAgentMessageFeedbackMock.mockReturnValue({ messageId: 1 })
        useHasAgentPrivilegesMock.mockReturnValue(true)
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('Back')).toBeInTheDocument()
    })
})
