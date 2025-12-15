import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import { ShoppingAssistantLineChart } from './ShoppingAssistantLineChart'

describe('ShoppingAssistantLineChart', () => {
    it('should render the default metric title', () => {
        render(<ShoppingAssistantLineChart />)

        const elements = screen.getAllByText('Total sales')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<ShoppingAssistantLineChart />)

        expect(screen.getByText('$3,800')).toBeInTheDocument()
    })

    it('should render the trend percentage', () => {
        render(<ShoppingAssistantLineChart />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<ShoppingAssistantLineChart />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render select dropdown', () => {
        render(<ShoppingAssistantLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Total sales/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should show chevron down icon when closed', () => {
        const { container } = render(<ShoppingAssistantLineChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should render with positive trend styles', () => {
        render(<ShoppingAssistantLineChart />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should open dropdown when clicking select button', async () => {
        const user = userEvent.setup()
        render(<ShoppingAssistantLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Total sales/i,
        })

        await act(() => user.click(selectButton))

        const options = screen.getAllByText('Orders influenced')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should show chevron up icon when dropdown is open', async () => {
        const user = userEvent.setup()
        const { container } = render(<ShoppingAssistantLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Total sales/i,
        })

        await act(() => user.click(selectButton))

        const chevronUpIcon = container.querySelector(
            '[aria-label="arrow-chevron-up"]',
        )
        expect(chevronUpIcon).toBeInTheDocument()
    })

    it('should render all metric options in dropdown', async () => {
        const user = userEvent.setup()
        render(<ShoppingAssistantLineChart />)

        const selectButton = screen.getByRole('button', {
            name: /Total sales/i,
        })

        await act(() => user.click(selectButton))

        const totalSalesOptions = screen.getAllByText('Total sales')
        expect(totalSalesOptions.length).toBeGreaterThan(0)

        const ordersInfluencedOptions = screen.getAllByText('Orders influenced')
        expect(ordersInfluencedOptions.length).toBeGreaterThan(0)

        const resolvedInteractionsOptions = screen.getAllByText(
            'Resolved interactions',
        )
        expect(resolvedInteractionsOptions.length).toBeGreaterThan(0)

        const revenuePerInteractionOptions = screen.getAllByText(
            'Revenue per interaction',
        )
        expect(revenuePerInteractionOptions.length).toBeGreaterThan(0)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<ShoppingAssistantLineChart />)

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
        const { container } = render(<ShoppingAssistantLineChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply trendTextNegative class for negative trend', () => {
        render(<ShoppingAssistantLineChart trend={-2} />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should render with neutral trend (zero)', () => {
        const { container } = render(<ShoppingAssistantLineChart trend={0} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply neutral color for zero trend', () => {
        render(<ShoppingAssistantLineChart trend={0} />)

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render custom value when provided', () => {
        render(<ShoppingAssistantLineChart value="$5,000" />)

        expect(screen.getByText('$5,000')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        render(<ShoppingAssistantLineChart trend={5} />)

        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
