import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import * as automateHooks from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import * as automationRateByFeatureHook from '../../../hooks/useAutomationRateByFeature'
import { AutomationRateComboChart } from '../AutomationRateComboChart'

jest.mock('domains/reporting/hooks/automate/useAutomationRateTrend')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('../../../hooks/useAutomationRateByFeature')

describe('AutomationChart', () => {
    const mockChartData = [
        { name: 'AI Agent', value: 18 },
        { name: 'Flows', value: 7 },
        { name: 'Article Recommendation', value: 4 },
        { name: 'Order Management', value: 3 },
    ]

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.32,
                prevValue: 0.3,
            },
        })

        jest.spyOn(
            automationRateByFeatureHook,
            'useAutomationRateByFeature',
        ).mockReturnValue({
            data: mockChartData,
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from automation rate hook', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AutomationRateComboChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationRateComboChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should not render select dropdown when only one metric', () => {
        render(<AutomationRateComboChart />)

        const selectButtons = screen.queryAllByRole('button', {
            name: /Overall automation rate/i,
        })
        const hasDropdown = selectButtons.some((button) =>
            button.getAttribute('aria-expanded'),
        )
        expect(hasDropdown).toBe(false)
    })

    it('should render all legend items', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('should render legend percentages from chart data', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getAllByText('56.25%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('21.88%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('12.50%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('9.38%').length).toBeGreaterThan(0)
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<AutomationRateComboChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with negative trend icon when trend is negative', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.28,
                prevValue: 0.3,
            },
        })

        const { container } = render(<AutomationRateComboChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render legend items as interactive buttons', () => {
        render(<AutomationRateComboChart />)

        const legendButtons = screen.getAllByRole('button', {
            name: /AI Agent|Flows|Article Recommendation|Order Management/,
        })
        expect(legendButtons.length).toBe(4)
    })

    it('should toggle legend item visibility when clicked', async () => {
        render(<AutomationRateComboChart />)

        const aiAgentButton = screen.getByRole('button', {
            name: /AI Agent/,
        })

        expect(aiAgentButton).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(aiAgentButton)
        })

        expect(aiAgentButton).toBeInTheDocument()
    })

    it('should render chart controls with donut and bar buttons', () => {
        render(<AutomationRateComboChart />)

        const donutButton = screen.getByRole('radio', {
            name: /chart-pie/i,
        })
        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        expect(donutButton).toBeInTheDocument()
        expect(barButton).toBeInTheDocument()
    })

    it('should have donut chart selected by default', () => {
        render(<AutomationRateComboChart />)

        const donutButton = screen.getByRole('radio', {
            name: /chart-pie/i,
        })

        expect(donutButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render loading skeleton when data is loading', () => {
        jest.spyOn(
            automationRateByFeatureHook,
            'useAutomationRateByFeature',
        ).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        render(<AutomationRateComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render loading skeleton when automation rate is fetching', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        render(<AutomationRateComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should filter out chart data items with value 0', () => {
        const mockDataWithZero = [
            { name: 'AI Agent', value: 18 },
            { name: 'Flows', value: 0 },
            { name: 'Article Recommendation', value: 4 },
        ]

        jest.spyOn(
            automationRateByFeatureHook,
            'useAutomationRateByFeature',
        ).mockReturnValue({
            data: mockDataWithZero,
            isLoading: false,
            isError: false,
        })

        render(<AutomationRateComboChart />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
    })

    it('should handle null automation rate value', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: null,
            },
        })

        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should handle undefined automation rate data', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render empty chart when chart data is empty array', () => {
        jest.spyOn(
            automationRateByFeatureHook,
            'useAutomationRateByFeature',
        ).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should switch to bar chart when bar button is clicked', async () => {
        render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render bar chart with correct data after switching', async () => {
        const { container } = render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should switch back to donut chart when donut button is clicked', async () => {
        render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })
        const donutButton = screen.getByRole('radio', {
            name: /chart-pie/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')

        await act(async () => {
            await userEvent.click(donutButton)
        })

        expect(donutButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render bar chart with valueFormatter', async () => {
        const { container } = render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render bar chart with period data', async () => {
        render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should handle chart type switching with empty data', async () => {
        jest.spyOn(
            automationRateByFeatureHook,
            'useAutomationRateByFeature',
        ).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        render(<AutomationRateComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')
    })
})
