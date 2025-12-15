import { render, screen } from '@testing-library/react'

import { AnalyticsAllAgentsComboChart } from './AnalyticsAllAgentsComboChart'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart',
    () => ({
        AutomationRateComboChart: () => <div>AutomationRateComboChart</div>,
    }),
)

describe('AnalyticsAllAgentsComboChart', () => {
    it('should render AutomationRateComboChart component', () => {
        render(<AnalyticsAllAgentsComboChart />)

        expect(screen.getByText('AutomationRateComboChart')).toBeInTheDocument()
    })
})
