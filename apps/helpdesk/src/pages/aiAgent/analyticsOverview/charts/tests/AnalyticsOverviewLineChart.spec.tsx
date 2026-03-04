import { render } from '@testing-library/react'

import { AnalyticsOverviewLineChart } from '../AnalyticsOverviewLineChart'

jest.mock('../../components/AutomationLineChart/AutomationLineChart', () => ({
    AutomationLineChart: () => (
        <div data-testid="automation-line-chart">AutomationLineChart</div>
    ),
}))

describe('AnalyticsOverviewLineChart', () => {
    it('should render AutomationLineChart component', () => {
        const { getByTestId } = render(<AnalyticsOverviewLineChart />)

        expect(getByTestId('automation-line-chart')).toBeInTheDocument()
    })
})
