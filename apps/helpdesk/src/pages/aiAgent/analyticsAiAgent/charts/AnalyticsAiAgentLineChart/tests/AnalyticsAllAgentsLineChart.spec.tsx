import { render, screen } from '@testing-library/react'

import { AnalyticsAllAgentsLineChart } from '../AnalyticsAllAgentsLineChart'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/AIAgentAutomationLineChart/AIAgentAutomationLineChart',
    () => ({
        AIAgentAutomationLineChart: () => <div>AIAgentAutomationLineChart</div>,
    }),
)

describe('AnalyticsAllAgentsLineChart', () => {
    it('should render AIAgentAutomationLineChart component', () => {
        render(<AnalyticsAllAgentsLineChart />)

        expect(
            screen.getByText('AIAgentAutomationLineChart'),
        ).toBeInTheDocument()
    })
})
