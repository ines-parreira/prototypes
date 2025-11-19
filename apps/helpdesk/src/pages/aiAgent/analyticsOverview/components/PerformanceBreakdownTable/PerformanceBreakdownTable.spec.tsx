import { render, screen } from '@testing-library/react'

import { PerformanceBreakdownTable } from './PerformanceBreakdownTable'

describe('PerformanceBreakdownTable', () => {
    it('should render the table heading', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render button group for filtering', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('All features')).toBeInTheDocument()
        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
    })

    it('should render the correct number of rows', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
    })

    it('should render table with all column headers', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('Feature')).toBeInTheDocument()
        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handed over')).toBeInTheDocument()
        expect(screen.getByText('Cost saved')).toBeInTheDocument()
        expect(screen.getByText('Time saved per agent')).toBeInTheDocument()
        expect(
            screen.getByText('Decrease in resolution time'),
        ).toBeInTheDocument()
    })

    it('should render correct data for AI Agent row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
        expect(screen.getByText('2,700')).toBeInTheDocument()
        expect(screen.getAllByText('7%').length).toBeGreaterThan(0)
        expect(screen.getByText('$1,200')).toBeInTheDocument()
        expect(screen.getByText('2h 45m')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('should render correct data for Article Recommendation row', () => {
        render(<PerformanceBreakdownTable />)

        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('4%').length).toBeGreaterThan(0)
        expect(screen.getByText('450')).toBeInTheDocument()
        expect(screen.getAllByText('5%').length).toBeGreaterThan(0)
        expect(screen.getByText('$450')).toBeInTheDocument()
        expect(screen.getByText('1h 00m')).toBeInTheDocument()
    })

    it('should render correct data for Flows row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('7%').length).toBeGreaterThan(0)
        expect(screen.getByText('900')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()
        expect(screen.getByText('1h 15m')).toBeInTheDocument()
    })

    it('should render correct data for Order Management row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
        expect(screen.getAllByText('3%').length).toBeGreaterThan(0)
        expect(screen.getByText('350')).toBeInTheDocument()
        expect(screen.getByText('$250')).toBeInTheDocument()
        expect(screen.getByText('0h 30m')).toBeInTheDocument()
    })

    it('should format large numbers with commas', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('2,700')).toBeInTheDocument()
    })

    it('should render TableToolbar component', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('4 items')).toBeInTheDocument()
    })

    it('should have settings button in toolbar', () => {
        render(<PerformanceBreakdownTable />)

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render all info icons for column headers', () => {
        const { container } = render(<PerformanceBreakdownTable />)

        const infoIcons = container.querySelectorAll('[aria-label="info"]')
        expect(infoIcons.length).toBeGreaterThan(0)
    })
})
