import { render, screen } from '@testing-library/react'

import { AnalyticsAllAgentsPerformanceTable } from '../AnalyticsAllAgentsPerformanceTable'

jest.mock(
    '../../../components/AiAgentPerformanceBreakdownTable/AllAgentsPerformanceBreakdownTable',
    () => ({
        AllAgentsPerformanceBreakdownTable: () => (
            <div>AllAgentsPerformanceBreakdownTable</div>
        ),
    }),
)

describe('AnalyticsAllAgentsPerformanceTable', () => {
    it('should render AllAgentsPerformanceBreakdownTable component', () => {
        render(<AnalyticsAllAgentsPerformanceTable />)

        expect(
            screen.getByText('AllAgentsPerformanceBreakdownTable'),
        ).toBeInTheDocument()
    })
})
