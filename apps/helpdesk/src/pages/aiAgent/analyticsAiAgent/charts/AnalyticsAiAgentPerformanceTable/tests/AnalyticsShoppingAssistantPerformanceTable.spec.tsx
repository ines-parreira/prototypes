import { render, screen } from '@testing-library/react'

import { AnalyticsShoppingAssistantPerformanceTable } from '../AnalyticsShoppingAssistantPerformanceTable'

jest.mock(
    '../../../components/AiAgentPerformanceBreakdownTable/ShoppingAssistantPerformanceBreakdownTable',
    () => ({
        ShoppingAssistantPerformanceBreakdownTable: () => (
            <div>ShoppingAssistantPerformanceBreakdownTable</div>
        ),
    }),
)

describe('AnalyticsShoppingAssistantPerformanceTable', () => {
    it('should render ShoppingAssistantPerformanceBreakdownTable component', () => {
        render(<AnalyticsShoppingAssistantPerformanceTable />)

        expect(
            screen.getByText('ShoppingAssistantPerformanceBreakdownTable'),
        ).toBeInTheDocument()
    })
})
