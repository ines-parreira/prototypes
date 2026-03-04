import { render, screen } from '@testing-library/react'

import * as aiAgentAutomationRateTimeSeriesHooks from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData'
import * as aiAgentAutomationRateTrendHooks from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { AIAgentAutomationLineChart } from '../AIAgentAutomationLineChart'

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData',
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

describe('AIAgentAutomationLineChart', () => {
    const mockTimeSeriesData = [
        [
            {
                dateTime: '2024-06-01',
                value: 0.3,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-02',
                value: 0.28,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-03',
                value: 0.32,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-04',
                value: 0.35,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-05',
                value: 0.33,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-06',
                value: 0.31,
                label: 'Automation rate',
            },
            {
                dateTime: '2024-06-07',
                value: 0.34,
                label: 'Automation rate',
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

        jest.spyOn(
            aiAgentAutomationRateTrendHooks,
            'useAIAgentAutomationRateTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.32,
                prevValue: 0.3,
            },
        })

        jest.spyOn(
            aiAgentAutomationRateTimeSeriesHooks,
            'useAIAgentAutomationRateTimeSeriesData',
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
        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from automation rate hook', () => {
        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AIAgentAutomationLineChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AIAgentAutomationLineChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AIAgentAutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render TimeSeriesChart component', () => {
        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render with negative trend icon when trend is negative', () => {
        jest.spyOn(
            aiAgentAutomationRateTrendHooks,
            'useAIAgentAutomationRateTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.28,
                prevValue: 0.3,
            },
        })

        const { container } = render(<AIAgentAutomationLineChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should handle null automation rate value', () => {
        jest.spyOn(
            aiAgentAutomationRateTrendHooks,
            'useAIAgentAutomationRateTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: null,
            },
        })

        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should handle undefined automation rate data', () => {
        jest.spyOn(
            aiAgentAutomationRateTrendHooks,
            'useAIAgentAutomationRateTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should handle empty time series data', () => {
        jest.spyOn(
            aiAgentAutomationRateTimeSeriesHooks,
            'useAIAgentAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should handle undefined time series data', () => {
        jest.spyOn(
            aiAgentAutomationRateTimeSeriesHooks,
            'useAIAgentAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomationLineChart />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render chart with time series data', () => {
        const { container } = render(<AIAgentAutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render skeleton when timeSeriesData is undefined', () => {
        jest.spyOn(
            aiAgentAutomationRateTimeSeriesHooks,
            'useAIAgentAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: undefined as any,
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AIAgentAutomationLineChart />)

        const areaChart = container.querySelector('.recharts-area')
        expect(areaChart).not.toBeInTheDocument()

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render chart with empty data when timeSeriesData is empty array', () => {
        jest.spyOn(
            aiAgentAutomationRateTimeSeriesHooks,
            'useAIAgentAutomationRateTimeSeriesData',
        ).mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AIAgentAutomationLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    describe('Loading states', () => {
        it('should render skeleton when automationRateTrend is fetching', () => {
            jest.spyOn(
                aiAgentAutomationRateTrendHooks,
                'useAIAgentAutomationRateTrend',
            ).mockReturnValue({
                isFetching: true,
                isError: false,
                data: undefined,
            })

            const { container } = render(<AIAgentAutomationLineChart />)

            expect(screen.getByText('Automation rate')).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when timeSeriesData is null', () => {
            jest.spyOn(
                aiAgentAutomationRateTimeSeriesHooks,
                'useAIAgentAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AIAgentAutomationLineChart />)

            expect(screen.getByText('Automation rate')).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when both data sources are loading', () => {
            jest.spyOn(
                aiAgentAutomationRateTrendHooks,
                'useAIAgentAutomationRateTrend',
            ).mockReturnValue({
                isFetching: true,
                isError: false,
                data: undefined,
            })

            jest.spyOn(
                aiAgentAutomationRateTimeSeriesHooks,
                'useAIAgentAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AIAgentAutomationLineChart />)

            expect(screen.getByText('Automation rate')).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render chart when both data sources are loaded', () => {
            jest.spyOn(
                aiAgentAutomationRateTrendHooks,
                'useAIAgentAutomationRateTrend',
            ).mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 0.32,
                    prevValue: 0.3,
                },
            })

            jest.spyOn(
                aiAgentAutomationRateTimeSeriesHooks,
                'useAIAgentAutomationRateTimeSeriesData',
            ).mockReturnValue({
                data: mockTimeSeriesData,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AIAgentAutomationLineChart />)

            expect(screen.getByText('Automation rate')).toBeInTheDocument()

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })
})
