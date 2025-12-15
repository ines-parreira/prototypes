import { render, screen } from '@testing-library/react'

import { ShoppingAssistantPerformanceBreakdownTable } from './ShoppingAssistantPerformanceBreakdownTable'

describe('ShoppingAssistantPerformanceBreakdownTable', () => {
    it('should render the table heading', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render button group for filtering', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(
            screen.getAllByText('Engagement feature').length,
        ).toBeGreaterThan(0)
        expect(screen.getByText('Channel')).toBeInTheDocument()
        expect(screen.getByText('Intent')).toBeInTheDocument()
        expect(screen.getByText('Top products recommended')).toBeInTheDocument()
    })

    it('should render the correct number of rows', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Trigger on search')).toBeInTheDocument()
        expect(
            screen.getByText('Suggested product questions'),
        ).toBeInTheDocument()
        expect(screen.getByText('Ask anything input')).toBeInTheDocument()
        expect(screen.getByText('Chat interaction')).toBeInTheDocument()
        expect(screen.getByText('Email interaction')).toBeInTheDocument()
    })

    it('should render table with all column headers', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(
            screen.getAllByText('Engagement feature').length,
        ).toBeGreaterThan(0)
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Success rate')).toBeInTheDocument()
        expect(screen.getByText('Orders influenced')).toBeInTheDocument()
        expect(screen.getByText('Conversion rate')).toBeInTheDocument()
        expect(screen.getByText('Total sales')).toBeInTheDocument()
        expect(screen.getByText('Cost per interaction')).toBeInTheDocument()
    })

    it('should render correct data for Trigger on search row', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Trigger on search')).toBeInTheDocument()
        expect(screen.getAllByText('1659').length).toBeGreaterThan(0)
        expect(screen.getAllByText('25%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('150').length).toBeGreaterThan(0)
    })

    it('should render correct data for Suggested product questions row', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(
            screen.getByText('Suggested product questions'),
        ).toBeInTheDocument()
        expect(screen.getAllByText('1998').length).toBeGreaterThan(0)
        expect(screen.getAllByText('60%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('10').length).toBeGreaterThan(0)
    })

    it('should render correct data for Ask anything input row', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Ask anything input')).toBeInTheDocument()
        expect(screen.getAllByText('1499').length).toBeGreaterThan(0)
        expect(screen.getAllByText('123').length).toBeGreaterThan(0)
    })

    it('should render correct data for Chat interaction row', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Chat interaction')).toBeInTheDocument()
        expect(screen.getAllByText('1989').length).toBeGreaterThan(0)
        expect(screen.getAllByText('67%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('420').length).toBeGreaterThan(0)
        expect(screen.getAllByText('48%').length).toBeGreaterThan(0)
    })

    it('should render correct data for Email interaction row', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('Email interaction')).toBeInTheDocument()
        expect(screen.getAllByText('1767').length).toBeGreaterThan(0)
        expect(screen.getAllByText('74%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('893').length).toBeGreaterThan(0)
        expect(screen.getAllByText('34%').length).toBeGreaterThan(0)
    })

    it('should format large numbers', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getAllByText('1659').length).toBeGreaterThan(0)
        expect(screen.getAllByText('1998').length).toBeGreaterThan(0)
        expect(screen.getAllByText('1499').length).toBeGreaterThan(0)
    })

    it('should render TableToolbar component', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        expect(screen.getByText('5 items')).toBeInTheDocument()
    })

    it('should have settings button in toolbar', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />)

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render all info icons for column headers', () => {
        const { container } = render(
            <ShoppingAssistantPerformanceBreakdownTable />,
        )

        const infoIcons = container.querySelectorAll('[aria-label="info"]')
        expect(infoIcons.length).toBeGreaterThan(0)
    })
})
