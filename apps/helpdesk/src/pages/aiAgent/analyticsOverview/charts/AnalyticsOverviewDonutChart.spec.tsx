import { render } from '@testing-library/react'

import { AnalyticsOverviewDonutChart } from './AnalyticsOverviewDonutChart'

jest.mock('../components/AutomationDonutChart/AutomationDonutChart', () => ({
    AutomationDonutChart: () => (
        <div data-testid="automation-donut-chart">AutomationDonutChart</div>
    ),
}))

describe('AnalyticsOverviewDonutChart', () => {
    it('should render AutomationDonutChart component', () => {
        const { getByTestId } = render(<AnalyticsOverviewDonutChart />)

        expect(getByTestId('automation-donut-chart')).toBeInTheDocument()
    })
})
