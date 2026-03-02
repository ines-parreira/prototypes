import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewPerformanceTable } from './AnalyticsOverviewPerformanceTable'

jest.mock(
    '../components/PerformanceBreakdownTable/PerformanceBreakdownTable',
    () => ({
        PerformanceBreakdownTable: jest.fn(() => (
            <div>PerformanceBreakdownTable</div>
        )),
    }),
)

describe('AnalyticsOverviewPerformanceTable', () => {
    it('should render PerformanceBreakdownTable component', () => {
        render(<AnalyticsOverviewPerformanceTable />)

        expect(
            screen.getByText('PerformanceBreakdownTable'),
        ).toBeInTheDocument()
    })
})
