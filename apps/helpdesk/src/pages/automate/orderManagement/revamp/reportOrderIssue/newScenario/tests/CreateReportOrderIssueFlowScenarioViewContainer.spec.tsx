import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { CreateReportOrderIssueFlowScenarioViewContainerRevamp } from '../CreateReportOrderIssueFlowScenarioViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    Redirect: ({ to }: { to: string }) => <div>Redirect to {to}</div>,
}))
jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('../CreateReportOrderIssueFlowScenarioView', () => ({
    CreateReportOrderIssueScenarioView: () => (
        <div>CreateReportOrderIssueScenarioView</div>
    ),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

describe('CreateReportOrderIssueFlowScenarioViewContainerRevamp', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'my-store' })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    it('should render the create scenario view when user has access', () => {
        render(<CreateReportOrderIssueFlowScenarioViewContainerRevamp />)

        expect(
            screen.getByText('CreateReportOrderIssueScenarioView'),
        ).toBeInTheDocument()
        expect(screen.queryByText(/redirect/i)).not.toBeInTheDocument()
    })

    it('should redirect when user does not have access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        render(<CreateReportOrderIssueFlowScenarioViewContainerRevamp />)

        expect(
            screen.getByText('Redirect to /app/automation/order-management'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('CreateReportOrderIssueScenarioView'),
        ).not.toBeInTheDocument()
    })
})
