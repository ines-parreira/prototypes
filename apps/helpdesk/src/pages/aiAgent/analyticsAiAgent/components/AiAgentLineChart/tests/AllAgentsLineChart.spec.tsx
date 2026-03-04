import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderTickLabelAsPercentage } from 'domains/reporting/pages/utils'

import { AllAgentsLineChart } from '../AllAgentsLineChart'

describe('AllAgentsLineChart', () => {
    it('should render the default metric title', () => {
        render(<AllAgentsLineChart />)

        const elements = screen.getAllByText('Automation rate')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<AllAgentsLineChart />)

        expect(screen.getByText('28%')).toBeInTheDocument()
    })

    it('should render the trend percentage', () => {
        render(<AllAgentsLineChart />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AllAgentsLineChart />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render select dropdown', () => {
        render(<AllAgentsLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Automation rate/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should show chevron down icon when closed', () => {
        const { container } = render(<AllAgentsLineChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should render with positive trend styles', () => {
        render(<AllAgentsLineChart />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should open dropdown when clicking select button', async () => {
        const user = userEvent.setup()
        render(<AllAgentsLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Automation rate/i,
        })

        await act(() => user.click(selectButton))

        const options = screen.getAllByText('Automated interactions')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should show chevron up icon when dropdown is open', async () => {
        const user = userEvent.setup()
        const { container } = render(<AllAgentsLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Automation rate/i,
        })

        await act(() => user.click(selectButton))

        const chevronUpIcon = container.querySelector(
            '[aria-label="arrow-chevron-up"]',
        )
        expect(chevronUpIcon).toBeInTheDocument()
    })

    it('should render all metric options in dropdown', async () => {
        const user = userEvent.setup()
        render(<AllAgentsLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Automation rate/i,
        })

        await act(() => user.click(selectButton))

        const automationRateOptions = screen.getAllByText('Automation rate')
        expect(automationRateOptions.length).toBeGreaterThan(0)

        const automatedInteractionsOptions = screen.getAllByText(
            'Automated interactions',
        )
        expect(automatedInteractionsOptions.length).toBeGreaterThan(0)

        const totalSalesOptions = screen.getAllByText('Total sales')
        expect(totalSalesOptions.length).toBeGreaterThan(0)

        const timeSavedOptions = screen.getAllByText('Time saved by agents')
        expect(timeSavedOptions.length).toBeGreaterThan(0)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AllAgentsLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should format Y-axis values as percentages', () => {
        expect(renderTickLabelAsPercentage(20)).toBe('20%')
        expect(renderTickLabelAsPercentage(50)).toBe('50%')
        expect(renderTickLabelAsPercentage(100)).toBe('100%')
    })

    it('should render with negative trend icon', () => {
        const { container } = render(<AllAgentsLineChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply trendTextNegative class for negative trend', () => {
        render(<AllAgentsLineChart trend={-2} />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should render with neutral trend (zero)', () => {
        const { container } = render(<AllAgentsLineChart trend={0} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply neutral color for zero trend', () => {
        render(<AllAgentsLineChart trend={0} />)

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render custom value when provided', () => {
        render(<AllAgentsLineChart value="45%" />)

        expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        render(<AllAgentsLineChart trend={5} />)

        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
