import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AutomationDonutChart } from './AutomationDonutChart'

describe('AutomationDonutChart', () => {
    it('should render the default metric title', () => {
        render(<AutomationDonutChart />)

        const elements = screen.getAllByText('Overall automation rate')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<AutomationDonutChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend percentage', () => {
        render(<AutomationDonutChart />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationDonutChart />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render select dropdown', () => {
        render(<AutomationDonutChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should render all legend items', () => {
        render(<AutomationDonutChart />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('should render legend percentages', () => {
        render(<AutomationDonutChart />)

        expect(screen.getByText('18%')).toBeInTheDocument()
        expect(screen.getByText('7%')).toBeInTheDocument()
        expect(screen.getByText('4%')).toBeInTheDocument()
        expect(screen.getByText('3%')).toBeInTheDocument()
    })

    it('should render chevron down icon when closed', () => {
        const { container } = render(<AutomationDonutChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should render with positive trend styles', () => {
        render(<AutomationDonutChart />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should render legend dots with correct colors', () => {
        const { container } = render(<AutomationDonutChart />)

        const legendDots = container.querySelectorAll('.legendDot')
        expect(legendDots.length).toBe(4)
    })

    it('should open dropdown when clicking select button', async () => {
        const user = userEvent.setup()
        render(<AutomationDonutChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(() => user.click(selectButton))

        const options = screen.getAllByText('Overall automation interactions')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should show chevron up icon when dropdown is open', async () => {
        const user = userEvent.setup()
        const { container } = render(<AutomationDonutChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(() => user.click(selectButton))

        const chevronUpIcon = container.querySelector(
            '[aria-label="arrow-chevron-up"]',
        )
        expect(chevronUpIcon).toBeInTheDocument()
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<AutomationDonutChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with negative trend icon', () => {
        const { container } = render(<AutomationDonutChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply error color for negative trend', () => {
        const { container } = render(<AutomationDonutChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply trendTextNegative class for negative trend', () => {
        render(<AutomationDonutChart trend={-2} />)

        const trendText = screen.getByText('2%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should render with neutral trend (zero)', () => {
        const { container } = render(<AutomationDonutChart trend={0} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply neutral color for zero trend', () => {
        render(<AutomationDonutChart trend={0} />)

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render custom value when provided', () => {
        render(<AutomationDonutChart value="45%" />)

        expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        render(<AutomationDonutChart trend={5} />)

        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
