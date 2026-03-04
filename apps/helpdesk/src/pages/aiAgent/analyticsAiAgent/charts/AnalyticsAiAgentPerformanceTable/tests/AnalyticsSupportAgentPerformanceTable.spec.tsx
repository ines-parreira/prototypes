import { render, screen } from '@testing-library/react'

import { AnalyticsSupportAgentPerformanceTable } from '../AnalyticsSupportAgentPerformanceTable'

jest.mock(
    '../../../components/AiAgentPerformanceBreakdownTable/SupportAgentPerformanceBreakdownTable',
    () => ({
        SupportAgentPerformanceBreakdownTable: () => (
            <div>SupportAgentPerformanceBreakdownTable</div>
        ),
    }),
)

describe('AnalyticsSupportAgentPerformanceTable', () => {
    it('should render SupportAgentPerformanceBreakdownTable component', () => {
        render(<AnalyticsSupportAgentPerformanceTable />)

        expect(
            screen.getByText('SupportAgentPerformanceBreakdownTable'),
        ).toBeInTheDocument()
    })
})
