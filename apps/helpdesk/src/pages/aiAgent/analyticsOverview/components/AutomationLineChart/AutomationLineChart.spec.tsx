import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import { AutomationLineChart } from './AutomationLineChart'

describe('AutomationLineChart', () => {
    it('should render the default metric title', () => {
        render(<AutomationLineChart />)

        const elements = screen.getAllByText('Overall automation rate')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<AutomationLineChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend percentage', () => {
        render(<AutomationLineChart />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationLineChart />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render select dropdown', () => {
        render(<AutomationLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should show chevron down icon when closed', () => {
        const { container } = render(<AutomationLineChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should render with positive trend styles', () => {
        render(<AutomationLineChart />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should open dropdown when clicking select button', async () => {
        const user = userEvent.setup()
        render(<AutomationLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(() => user.click(selectButton))

        const options = screen.getAllByText('Overall automation interactions')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should show chevron up icon when dropdown is open', async () => {
        const user = userEvent.setup()
        const { container } = render(<AutomationLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(() => user.click(selectButton))

        const chevronUpIcon = container.querySelector(
            '[aria-label="arrow-chevron-up"]',
        )
        expect(chevronUpIcon).toBeInTheDocument()
    })

    it('should render all metric options in dropdown', async () => {
        const user = userEvent.setup()
        render(<AutomationLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(() => user.click(selectButton))

        const automationRateOptions = screen.getAllByText(
            'Overall automation rate',
        )
        expect(automationRateOptions.length).toBeGreaterThan(0)

        const automationInteractionsOptions = screen.getAllByText(
            'Overall automation interactions',
        )
        expect(automationInteractionsOptions.length).toBeGreaterThan(0)

        const costSavedOptions = screen.getAllByText('Overall cost saved')
        expect(costSavedOptions.length).toBeGreaterThan(0)

        const timeSavedOptions = screen.getAllByText(
            'Overall time saved by agents',
        )
        expect(timeSavedOptions.length).toBeGreaterThan(0)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should format Y-axis values >= 1000 with compact notation', () => {
        expect(renderTickLabelAsNumber(1000)).toBe('1K')
        expect(renderTickLabelAsNumber(1500)).toBe('1.5K')
        expect(renderTickLabelAsNumber(2000)).toBe('2K')
    })

    it('should format Y-axis values < 1000 as plain numbers', () => {
        expect(renderTickLabelAsNumber(0)).toBe('0')
        expect(renderTickLabelAsNumber(500)).toBe('500')
        expect(renderTickLabelAsNumber(999)).toBe('999')
    })

    it('should format Y-axis values >= 1000000 with M suffix', () => {
        expect(renderTickLabelAsNumber(1000000)).toBe('1M')
        expect(renderTickLabelAsNumber(1500000)).toBe('1.5M')
        expect(renderTickLabelAsNumber(2000000)).toBe('2M')
    })

    it('should handle string values by returning them unchanged', () => {
        expect(renderTickLabelAsNumber('test')).toBe('test')
    })

    it('should render with negative trend icon', () => {
        const { container } = render(<AutomationLineChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply error color for negative trend', () => {
        const { container } = render(<AutomationLineChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply trendTextNegative class for negative trend', () => {
        render(<AutomationLineChart trend={-2} />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should render with neutral trend (zero)', () => {
        const { container } = render(<AutomationLineChart trend={0} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply neutral color for zero trend', () => {
        render(<AutomationLineChart trend={0} />)

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render custom value when provided', () => {
        render(<AutomationLineChart value="45%" />)

        expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        render(<AutomationLineChart trend={5} />)

        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
