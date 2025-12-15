import { render, screen } from '@testing-library/react'

import { AnalyticsSupportAgentLineChart } from './AnalyticsSupportAgentLineChart'

jest.mock('../../components/AiAgentLineChart/SupportAgentLineChart', () => ({
    SupportAgentLineChart: () => <div>SupportAgentLineChart</div>,
}))

describe('AnalyticsSupportAgentLineChart', () => {
    it('should render SupportAgentLineChart component', () => {
        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('SupportAgentLineChart')).toBeInTheDocument()
    })
})
