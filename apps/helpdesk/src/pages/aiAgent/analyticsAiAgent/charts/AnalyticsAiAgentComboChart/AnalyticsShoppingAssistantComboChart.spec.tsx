import { render, screen } from '@testing-library/react'

import { AnalyticsShoppingAssistantComboChart } from './AnalyticsShoppingAssistantComboChart'

jest.mock('../TotalSalesByProductComboChart', () => ({
    TotalSalesByProductComboChart: () => (
        <div data-testid="total-sales-chart">TotalSalesByProductComboChart</div>
    ),
}))

describe('AnalyticsShoppingAssistantComboChart', () => {
    it('should render TotalSalesByProductComboChart component', () => {
        render(<AnalyticsShoppingAssistantComboChart />)

        expect(
            screen.getByText('TotalSalesByProductComboChart'),
        ).toBeInTheDocument()
    })

    it('should render the child component with correct test id', () => {
        render(<AnalyticsShoppingAssistantComboChart />)

        expect(screen.getByTestId('total-sales-chart')).toBeInTheDocument()
    })

    it('should render without crashing', () => {
        const { container } = render(<AnalyticsShoppingAssistantComboChart />)

        expect(container).toBeTruthy()
    })

    it('should render only one child component', () => {
        render(<AnalyticsShoppingAssistantComboChart />)

        const charts = screen.getAllByTestId('total-sales-chart')
        expect(charts).toHaveLength(1)
    })
})
