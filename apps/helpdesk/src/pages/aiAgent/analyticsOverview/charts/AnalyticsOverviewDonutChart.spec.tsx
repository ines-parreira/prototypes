import { render } from '@testing-library/react'

import { AnalyticsOverviewDonutChart } from './AnalyticsOverviewDonutChart'

jest.mock(
    '../components/AutomationRateComboChart/AutomationRateComboChart',
    () => ({
        AutomationRateComboChart: () => (
            <div data-testid="automation-rate-combo-chart">
                AutomationRateComboChart
            </div>
        ),
    }),
)

describe('AnalyticsOverviewDonutChart', () => {
    it('should render AutomationRateComboChart component', () => {
        const { getByTestId } = render(<AnalyticsOverviewDonutChart />)

        expect(getByTestId('automation-rate-combo-chart')).toBeInTheDocument()
    })
})
