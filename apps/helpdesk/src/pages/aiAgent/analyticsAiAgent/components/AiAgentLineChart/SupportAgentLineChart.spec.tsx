import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import { SupportAgentLineChart } from './SupportAgentLineChart'

describe('SupportAgentLineChart', () => {
    it('should render the default metric title', () => {
        render(<SupportAgentLineChart />)

        const elements = screen.getAllByText('Time saved by agents')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<SupportAgentLineChart />)

        expect(screen.getByText('3,900')).toBeInTheDocument()
    })

    it('should render the trend percentage', () => {
        render(<SupportAgentLineChart />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<SupportAgentLineChart />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render select dropdown', () => {
        render(<SupportAgentLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Time saved by agents/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should show chevron down icon when closed', () => {
        const { container } = render(<SupportAgentLineChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should render with positive trend styles', () => {
        render(<SupportAgentLineChart />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should open dropdown when clicking select button', async () => {
        const user = userEvent.setup()
        render(<SupportAgentLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Time saved by agents/i,
        })

        await act(() => user.click(selectButton))

        const options = screen.getAllByText('Cost saved')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should show chevron up icon when dropdown is open', async () => {
        const user = userEvent.setup()
        const { container } = render(<SupportAgentLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Time saved by agents/i,
        })

        await act(() => user.click(selectButton))

        const chevronUpIcon = container.querySelector(
            '[aria-label="arrow-chevron-up"]',
        )
        expect(chevronUpIcon).toBeInTheDocument()
    })

    it('should render all metric options in dropdown', async () => {
        const user = userEvent.setup()
        render(<SupportAgentLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Time saved by agents/i,
        })

        await act(() => user.click(selectButton))

        const timeSavedOptions = screen.getAllByText('Time saved by agents')
        expect(timeSavedOptions.length).toBeGreaterThan(0)

        const costSavedOptions = screen.getAllByText('Cost saved')
        expect(costSavedOptions.length).toBeGreaterThan(0)

        const supportInteractionsOptions = screen.getAllByText(
            'Support interactions',
        )
        expect(supportInteractionsOptions.length).toBeGreaterThan(0)

        const decreaseInResolutionTimeOptions = screen.getAllByText(
            'Decrease in first resolution time',
        )
        expect(decreaseInResolutionTimeOptions.length).toBeGreaterThan(0)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<SupportAgentLineChart />)

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
        const { container } = render(<SupportAgentLineChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply trendTextNegative class for negative trend', () => {
        render(<SupportAgentLineChart trend={-2} />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should render with neutral trend (zero)', () => {
        const { container } = render(<SupportAgentLineChart trend={0} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply neutral color for zero trend', () => {
        render(<SupportAgentLineChart trend={0} />)

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render custom value when provided', () => {
        render(<SupportAgentLineChart value="5,000" />)

        expect(screen.getByText('5,000')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        render(<SupportAgentLineChart trend={5} />)

        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
