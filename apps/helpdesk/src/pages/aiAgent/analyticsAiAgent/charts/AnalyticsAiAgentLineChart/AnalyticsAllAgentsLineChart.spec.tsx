import { render, screen } from '@testing-library/react'

import { AnalyticsAllAgentsLineChart } from './AnalyticsAllAgentsLineChart'

jest.mock('../../components/AiAgentLineChart/AllAgentsLineChart', () => ({
    AllAgentsLineChart: () => <div>AllAgentsLineChart</div>,
}))

describe('AnalyticsAllAgentsLineChart', () => {
    it('should render AllAgentsLineChart component', () => {
        render(<AnalyticsAllAgentsLineChart />)

        expect(screen.getByText('AllAgentsLineChart')).toBeInTheDocument()
    })
})
