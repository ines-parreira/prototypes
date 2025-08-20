import { render } from '@testing-library/react'

import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import useAiAgentMessageFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback'

import useHasAIAgent from '../hooks/useHasAIAgent'
import TicketFeedback from '../TicketFeedback'

jest.mock('auto_qa', () => ({ AutoQA: () => <div>AutoQA</div> }))
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar',
    () => () => <div>AIAgentFeedbackBar</div>,
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback',
    () => jest.fn(),
)
const useAiAgentMessageFeedbackMock = useAiAgentMessageFeedback as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

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
        useAppSelectorMock.mockReturnValue({
            get: jest.fn().mockReturnValue(123), // Mock ticket ID
        })
    })

    it('should render an unauthorised message if neither AutoQA nor Agent AI are active', () => {
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('Unauthorized')).toBeInTheDocument()
        expect(
            getByText('You do not have permission to view ticket feedback.'),
        ).toBeInTheDocument()
    })

    it('should render AI Agent if it is active', () => {
        useHasAIAgentMock.mockReturnValue(true)
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('AIAgentFeedbackBar')).toBeInTheDocument()
    })

    it('should render a back button when a message is selected', () => {
        useAiAgentMessageFeedbackMock.mockReturnValue({ messageId: 1 })
        useHasAgentPrivilegesMock.mockReturnValue(true)
        const { getByText } = render(<TicketFeedback />)
        expect(getByText('Back')).toBeInTheDocument()
    })
})
