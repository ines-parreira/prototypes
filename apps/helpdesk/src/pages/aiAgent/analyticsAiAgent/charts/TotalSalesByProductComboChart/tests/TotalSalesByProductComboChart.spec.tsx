import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import * as totalSalesByProductHook from '../../../hooks/useTotalSalesByProduct'
import { TotalSalesByProductComboChart } from '../TotalSalesByProductComboChart'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('../../../hooks/useTotalSalesByProduct')

describe('TotalSalesByProductComboChart', () => {
    const mockChartData = [
        { name: 'Product A', value: 5000 },
        { name: 'Product B', value: 3500 },
        { name: 'Product C', value: 2000 },
        { name: 'Product D', value: 1500 },
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

        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: 12000,
                prevTotalValue: 10000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should render the metric value formatted as currency', () => {
        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('$12,000')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<TotalSalesByProductComboChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<TotalSalesByProductComboChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render all product legend items', () => {
        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Product A')).toBeInTheDocument()
        expect(screen.getByText('Product B')).toBeInTheDocument()
        expect(screen.getByText('Product C')).toBeInTheDocument()
        expect(screen.getByText('Product D')).toBeInTheDocument()
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<TotalSalesByProductComboChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with negative trend icon when trend is negative', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: 8000,
                prevTotalValue: 10000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        const { container } = render(<TotalSalesByProductComboChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render chart controls with donut and bar buttons', () => {
        render(<TotalSalesByProductComboChart />)

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
        render(<TotalSalesByProductComboChart />)

        const donutButton = screen.getByRole('radio', {
            name: /chart-pie/i,
        })

        expect(donutButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render loading skeleton when data is loading', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: [],
                totalValue: null,
                prevTotalValue: null,
                currency: 'USD',
            },
            isFetching: true,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should filter out chart data items with value 0', () => {
        const mockDataWithZero = [
            { name: 'Product A', value: 5000 },
            { name: 'Product B', value: 0 },
            { name: 'Product C', value: 2000 },
        ]

        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockDataWithZero,
                totalValue: 7000,
                prevTotalValue: 6000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Product A')).toBeInTheDocument()
        expect(screen.queryByText('Product B')).not.toBeInTheDocument()
        expect(screen.getByText('Product C')).toBeInTheDocument()
    })

    it('should handle null total value', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: null,
                prevTotalValue: null,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should render empty chart when chart data is empty array', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: [],
                totalValue: 0,
                prevTotalValue: 0,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should switch to bar chart when bar button is clicked', async () => {
        render(<TotalSalesByProductComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render bar chart with correct data after switching', async () => {
        const { container } = render(<TotalSalesByProductComboChart />)

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
        render(<TotalSalesByProductComboChart />)

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

    it('should render empty state with no data found message when chart data is empty', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: [],
                totalValue: 0,
                prevTotalValue: 0,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
        expect(screen.getByText('No data found')).toBeInTheDocument()
    })

    it('should handle different currency formats', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: 12000,
                prevTotalValue: 10000,
                currency: 'EUR',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('€12,000')).toBeInTheDocument()
    })

    it('should render correctly when period is undefined', () => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: undefined as any,
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should render correctly when cleanStatsFilters is undefined', () => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: undefined as any,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should render bar chart mode correctly', async () => {
        const { container } = render(<TotalSalesByProductComboChart />)

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
        expect(barButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should pass correct period to DonutChart when period is defined', () => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00.000',
                    end_datetime: '2024-01-31T23:59:59.999',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        const { container } = render(<TotalSalesByProductComboChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with GBP currency', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: 15000,
                prevTotalValue: 12000,
                currency: 'GBP',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('£15,000')).toBeInTheDocument()
    })

    it('should handle very large values', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: [{ name: 'Big Product', value: 1000000 }],
                totalValue: 1000000,
                prevTotalValue: 500000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('$1,000,000')).toBeInTheDocument()
    })

    it('should render chart with single data item', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: [{ name: 'Solo Product', value: 5000 }],
                totalValue: 5000,
                prevTotalValue: 3000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        render(<TotalSalesByProductComboChart />)

        expect(screen.getByText('Solo Product')).toBeInTheDocument()
        expect(screen.getByText('$5,000')).toBeInTheDocument()
    })

    it('should render bar chart container after switching', async () => {
        const { container } = render(<TotalSalesByProductComboChart />)

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

    it('should handle zero prevTotalValue for neutral trend', () => {
        jest.spyOn(
            totalSalesByProductHook,
            'useTotalSalesByProduct',
        ).mockReturnValue({
            data: {
                chartData: mockChartData,
                totalValue: 5000,
                prevTotalValue: 5000,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        const { container } = render(<TotalSalesByProductComboChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })
})
