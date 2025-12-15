import { render, screen } from '@testing-library/react'

import { AllAgentsPerformanceBreakdownTable } from './AllAgentsPerformanceBreakdownTable'

describe('AllAgentsPerformanceBreakdownTable', () => {
    it('should render the table heading', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render button group for filtering', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Channel')).toBeInTheDocument()
        expect(screen.getByText('Intent')).toBeInTheDocument()
        expect(screen.getByText('Skill')).toBeInTheDocument()
    })

    it('should render the correct number of rows', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Order')).toBeInTheDocument()
        expect(screen.getAllByText('Product').length).toBeGreaterThan(0)
        expect(screen.getByText('Return')).toBeInTheDocument()
        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('Warranty')).toBeInTheDocument()
    })

    it('should render table with all column headers', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Intent L1')).toBeInTheDocument()
        expect(screen.getByText('Intent L2')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent interactions share'),
        ).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Snoozed interactions')).toBeInTheDocument()
        expect(screen.getByText('Success rate')).toBeInTheDocument()
    })

    it('should render correct data for Order row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Order')).toBeInTheDocument()
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0)
        expect(screen.getAllByText('10%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('600').length).toBeGreaterThan(0)
        expect(screen.getAllByText('100').length).toBeGreaterThan(0)
        expect(screen.getAllByText('10').length).toBeGreaterThan(0)
        expect(screen.getAllByText('25%').length).toBeGreaterThan(0)
    })

    it('should render correct data for Product Details row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getAllByText('2%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('450').length).toBeGreaterThan(0)
        expect(screen.getAllByText('30').length).toBeGreaterThan(0)
        expect(screen.getAllByText('3').length).toBeGreaterThan(0)
        expect(screen.getAllByText('60%').length).toBeGreaterThan(0)
    })

    it('should render correct data for Product Issues row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Issues')).toBeInTheDocument()
        expect(screen.getAllByText('299').length).toBeGreaterThan(0)
        expect(screen.getAllByText('20%').length).toBeGreaterThan(0)
    })

    it('should render correct data for Return row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Return')).toBeInTheDocument()
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0)
        expect(screen.getAllByText('5%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('150').length).toBeGreaterThan(0)
        expect(screen.getAllByText('5').length).toBeGreaterThan(0)
        expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    })

    it('should render correct data for Shipping row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('Information')).toBeInTheDocument()
        expect(screen.getAllByText('1%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('100').length).toBeGreaterThan(0)
    })

    it('should render correct data for Warranty row', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('Warranty')).toBeInTheDocument()
        expect(screen.getByText('Claim')).toBeInTheDocument()
        expect(screen.getAllByText('4%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('40').length).toBeGreaterThan(0)
    })

    it('should render TableToolbar component', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        expect(screen.getByText('6 items')).toBeInTheDocument()
    })

    it('should have settings button in toolbar', () => {
        render(<AllAgentsPerformanceBreakdownTable />)

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render all info icons for column headers', () => {
        const { container } = render(<AllAgentsPerformanceBreakdownTable />)

        const infoIcons = container.querySelectorAll('[aria-label="info"]')
        expect(infoIcons.length).toBeGreaterThan(0)
    })
})
