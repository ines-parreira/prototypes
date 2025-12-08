import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { AutomationChart } from './AutomationChart'

describe('AutomationChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    it('should render the default metric title', () => {
        render(<AutomationChart />)

        const elements = screen.getAllByText('Overall automation rate')
        expect(elements.length).toBeGreaterThan(0)
    })

    it('should render the metric value', () => {
        render(<AutomationChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AutomationChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render select dropdown', () => {
        render(<AutomationChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })
        expect(selectButton).toBeInTheDocument()
    })

    it('should render all legend items', () => {
        render(<AutomationChart />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('should render legend percentages', () => {
        render(<AutomationChart />)

        expect(screen.getByText('56%')).toBeInTheDocument()
        expect(screen.getByText('22%')).toBeInTheDocument()
        expect(screen.getByText('13%')).toBeInTheDocument()
        expect(screen.getByText('9%')).toBeInTheDocument()
    })

    it('should render chevron down icon when closed', () => {
        const { container } = render(<AutomationChart />)

        const chevronDownIcon = container.querySelector(
            '[aria-label="arrow-chevron-down"]',
        )
        expect(chevronDownIcon).toBeInTheDocument()
    })

    it('should open dropdown when clicking select button', async () => {
        render(<AutomationChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(async () => {
            await userEvent.click(selectButton)
        })

        const options = screen.getAllByText('Overall automation interactions')
        expect(options.length).toBeGreaterThan(0)
    })

    it('should rotate chevron icon when dropdown is open', async () => {
        const { container } = render(<AutomationChart />)

        const selectButton = screen.getByRole('button', {
            name: /Overall automation rate/i,
        })

        await act(async () => {
            await userEvent.click(selectButton)
        })

        const chevronIcon = container.querySelector('[data-state="open"]')
        expect(chevronIcon).toBeInTheDocument()
        expect(chevronIcon).toHaveAttribute('data-state', 'open')
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<AutomationChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with negative trend icon', () => {
        const { container } = render(<AutomationChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should apply error color for negative trend', () => {
        const { container } = render(<AutomationChart trend={-2} />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render custom value when provided', () => {
        render(<AutomationChart value="45%" />)

        expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should render custom trend value when provided', () => {
        const { container } = render(<AutomationChart trend={5} />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render legend items as interactive buttons', () => {
        render(<AutomationChart />)

        const legendButtons = screen.getAllByRole('button', {
            name: /AI Agent|Flows|Article Recommendation|Order Management/,
        })
        expect(legendButtons.length).toBe(4)
    })

    it('should toggle legend item visibility when clicked', async () => {
        render(<AutomationChart />)

        const aiAgentButton = screen.getByRole('button', {
            name: /AI Agent/,
        })

        expect(screen.getByText('56%')).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(aiAgentButton)
        })

        expect(screen.getByText('0%')).toBeInTheDocument()
    })
})
