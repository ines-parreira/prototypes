import { render, screen } from '@testing-library/react'

import { AnalyticsSupportAgentComboChart } from './AnalyticsSupportAgentComboChart'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart',
    () => ({
        AutomationRateComboChart: () => <div>AutomationRateComboChart</div>,
    }),
)

describe('AnalyticsSupportAgentComboChart', () => {
    it('should render AutomationRateComboChart component', () => {
        render(<AnalyticsSupportAgentComboChart />)

        expect(screen.getByText('AutomationRateComboChart')).toBeInTheDocument()
    })
})
