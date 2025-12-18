import { render, screen } from '@testing-library/react'

import * as automationRateTimeSeriesHooks from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import * as automateHooks from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import {
    AutomationLineChart,
    CustomTooltip,
    formatYAxisTick,
} from './AutomationLineChart'

jest.mock('domains/reporting/hooks/automate/useAutomationRateTrend')
jest.mock('domains/reporting/hooks/automate/useAutomationRateTimeSeriesData')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

describe('AutomationLineChart', () => {
    const mockTimeSeriesData = [
        [
            {
                dateTime: '2024-06-01',
                value: 0.3,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-02',
                value: 0.28,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-03',
                value: 0.32,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-04',
                value: 0.35,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-05',
                value: 0.33,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-06',
                value: 0.31,
                label: 'Overall automation rate',
            },
            {
                dateTime: '2024-06-07',
                value: 0.34,
                label: 'Overall automation rate',
            },
        ],
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
                    start_datetime: '2024-06-01',
                    end_datetime: '2024-06-07',
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
            automationRateTimeSeriesHooks,
            'useAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AutomationLineChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from automation rate hook', () => {
        render(<AutomationLineChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AutomationLineChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationLineChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
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

    it('should render with negative trend icon when trend is negative', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.28,
                prevValue: 0.3,
            },
        })

        const { container } = render(<AutomationLineChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
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

        render(<AutomationLineChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should handle undefined automation rate data', () => {
        jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        render(<AutomationLineChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should handle empty time series data', () => {
        jest.spyOn(
            automationRateTimeSeriesHooks,
            'useAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AutomationLineChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should handle undefined time series data', () => {
        jest.spyOn(
            automationRateTimeSeriesHooks,
            'useAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AutomationLineChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render chart with time series data', () => {
        const { container } = render(<AutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render skeleton when timeSeriesData is undefined', () => {
        jest.spyOn(
            automationRateTimeSeriesHooks,
            'useAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: undefined as any,
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AutomationLineChart />)

        const areaChart = container.querySelector('.recharts-area')
        expect(areaChart).not.toBeInTheDocument()

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render chart with empty data when timeSeriesData is empty array', () => {
        jest.spyOn(
            automationRateTimeSeriesHooks,
            'useAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    describe('Loading states', () => {
        it('should render skeleton when automationRateTrend is fetching', () => {
            jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue(
                {
                    isFetching: true,
                    isError: false,
                    data: undefined,
                },
            )

            const { container } = render(<AutomationLineChart />)

            expect(
                screen.getByText('Overall automation rate'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when timeSeriesData is null', () => {
            jest.spyOn(
                automationRateTimeSeriesHooks,
                'useAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AutomationLineChart />)

            expect(
                screen.getByText('Overall automation rate'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when both data sources are loading', () => {
            jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue(
                {
                    isFetching: true,
                    isError: false,
                    data: undefined,
                },
            )

            jest.spyOn(
                automationRateTimeSeriesHooks,
                'useAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AutomationLineChart />)

            expect(
                screen.getByText('Overall automation rate'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render chart when both data sources are loaded', () => {
            jest.spyOn(automateHooks, 'useAutomationRateTrend').mockReturnValue(
                {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 0.32,
                        prevValue: 0.3,
                    },
                },
            )

            jest.spyOn(
                automationRateTimeSeriesHooks,
                'useAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: mockTimeSeriesData,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AutomationLineChart />)

            expect(
                screen.getByText('Overall automation rate'),
            ).toBeInTheDocument()

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })
})

describe('CustomTooltip', () => {
    it('should return null when not active', () => {
        const result = CustomTooltip({
            active: false,
            payload: [{ value: 0.5 }] as any,
            label: 'Test',
        } as any)

        expect(result).toBeNull()
    })

    it('should return null when payload is undefined', () => {
        const result = CustomTooltip({
            active: true,
            payload: undefined as any,
            label: 'Test',
        } as any)

        expect(result).toBeNull()
    })

    it('should return null when payload is empty', () => {
        const result = CustomTooltip({
            active: true,
            payload: [],
            label: 'Test',
        } as any)

        expect(result).toBeNull()
    })

    it('should render tooltip with formatted percentage when active with valid payload', () => {
        const result = CustomTooltip({
            active: true,
            payload: [{ value: 0.5 }] as any,
            label: 'Jun 01',
        } as any)

        expect(result).not.toBeNull()
        const { container } = render(result!)

        expect(container.textContent).toContain('Jun 01')
        expect(container.textContent).toContain('50.0%')
    })

    it('should handle number label by converting to string', () => {
        const result = CustomTooltip({
            active: true,
            payload: [{ value: 0.75 }] as any,
            label: 123,
        } as any)

        expect(result).not.toBeNull()
        const { container } = render(result!)

        expect(container.textContent).toContain('123')
        expect(container.textContent).toContain('75.0%')
    })

    it('should handle non-number value by showing 0.0%', () => {
        const result = CustomTooltip({
            active: true,
            payload: [{ value: 'invalid' }] as any,
            label: 'Test',
        } as any)

        expect(result).not.toBeNull()
        const { container } = render(result!)

        expect(container.textContent).toContain('0.0%')
    })
})

describe('formatYAxisTick', () => {
    it('should format values < 10 as plain percentage', () => {
        expect(formatYAxisTick(0)).toBe('0')
        expect(formatYAxisTick(0.05)).toBe('5')
        expect(formatYAxisTick(0.5)).toBe('50')
        expect(formatYAxisTick(0.99)).toBe('99')
    })

    it('should format values >= 10 with K suffix', () => {
        expect(formatYAxisTick(10)).toBe('1K')
        expect(formatYAxisTick(15)).toBe('1.5K')
        expect(formatYAxisTick(20)).toBe('2K')
    })

    it('should format values with no decimal when evenly divisible by 1000', () => {
        expect(formatYAxisTick(10)).toBe('1K')
        expect(formatYAxisTick(20)).toBe('2K')
        expect(formatYAxisTick(100)).toBe('10K')
    })

    it('should format values with decimal when not evenly divisible by 1000', () => {
        expect(formatYAxisTick(12.5)).toBe('1.3K')
        expect(formatYAxisTick(15.75)).toBe('1.6K')
    })
})
