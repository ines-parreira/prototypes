import { render, screen } from '@testing-library/react'

import { AnalyticsShoppingAssistantLineChart } from './AnalyticsShoppingAssistantLineChart'

jest.mock(
    '../../components/AiAgentLineChart/ShoppingAssistantLineChart',
    () => ({
        ShoppingAssistantLineChart: () => <div>ShoppingAssistantLineChart</div>,
    }),
)

describe('AnalyticsShoppingAssistantLineChart', () => {
    it('should render ShoppingAssistantLineChart component', () => {
        render(<AnalyticsShoppingAssistantLineChart />)

        expect(
            screen.getByText('ShoppingAssistantLineChart'),
        ).toBeInTheDocument()
    })
})
