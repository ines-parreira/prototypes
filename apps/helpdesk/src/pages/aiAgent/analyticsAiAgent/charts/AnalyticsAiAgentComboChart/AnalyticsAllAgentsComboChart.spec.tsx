import { render, screen } from '@testing-library/react'

import { AnalyticsAllAgentsComboChart } from './AnalyticsAllAgentsComboChart'

jest.mock(
    'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsComboChart',
    () => ({
        AnalyticsOverviewAutomatedInteractionsComboChart: () => (
            <div>AnalyticsOverviewAutomatedInteractionsComboChart</div>
        ),
    }),
)

describe('AnalyticsAllAgentsComboChart', () => {
    it('should render AnalyticsOverviewAutomatedInteractionsComboChart component', () => {
        render(<AnalyticsAllAgentsComboChart />)

        expect(
            screen.getByText(
                'AnalyticsOverviewAutomatedInteractionsComboChart',
            ),
        ).toBeInTheDocument()
    })
})
