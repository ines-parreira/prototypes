import { render } from '@testing-library/react'

import { AnalyticsOverviewPerformanceTable } from './AnalyticsOverviewPerformanceTable'

jest.mock(
    '../components/PerformanceBreakdownTable/PerformanceBreakdownTable',
    () => ({
        PerformanceBreakdownTable: () => (
            <div data-testid="performance-breakdown-table">
                PerformanceBreakdownTable
            </div>
        ),
    }),
)

describe('AnalyticsOverviewPerformanceTable', () => {
    it('should render PerformanceBreakdownTable component', () => {
        const { getByTestId } = render(<AnalyticsOverviewPerformanceTable />)

        expect(getByTestId('performance-breakdown-table')).toBeInTheDocument()
    })
})
