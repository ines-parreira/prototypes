import { render } from '@testing-library/react'

import { AnalyticsOverviewDonutChart } from './AnalyticsOverviewDonutChart'

jest.mock('../components/AutomationChart/AutomationChart', () => ({
    AutomationChart: () => (
        <div data-testid="automation-chart">AutomationChart</div>
    ),
}))

describe('AnalyticsOverviewDonutChart', () => {
    it('should render AutomationChart component', () => {
        const { getByTestId } = render(<AnalyticsOverviewDonutChart />)

        expect(getByTestId('automation-chart')).toBeInTheDocument()
    })
})
