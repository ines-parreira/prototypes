import { render, screen } from '@testing-library/react'

import { AnalyticsShoppingAssistantComboChart } from './AnalyticsShoppingAssistantComboChart'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart',
    () => ({
        AutomationRateComboChart: () => <div>AutomationRateComboChart</div>,
    }),
)

describe('AnalyticsShoppingAssistantComboChart', () => {
    it('should render AutomationRateComboChart component', () => {
        render(<AnalyticsShoppingAssistantComboChart />)

        expect(screen.getByText('AutomationRateComboChart')).toBeInTheDocument()
    })
})
