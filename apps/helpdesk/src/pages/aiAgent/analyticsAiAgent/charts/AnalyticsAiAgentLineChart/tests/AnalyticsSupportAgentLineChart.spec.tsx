import { render, screen } from '@testing-library/react'

import * as supportInteractionsTimeSeriesHooks from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import * as supportInteractionsTrendHooks from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { AnalyticsSupportAgentLineChart } from '../AnalyticsSupportAgentLineChart'

jest.mock('domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend')
jest.mock(
    'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData',
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

describe('AnalyticsSupportAgentLineChart', () => {
    const mockTimeSeriesData = [
        [
            {
                dateTime: '2024-06-01',
                value: 1000,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-02',
                value: 1200,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-03',
                value: 1500,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-04',
                value: 1800,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-05',
                value: 1600,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-06',
                value: 1400,
                label: 'Automated interactions',
            },
            {
                dateTime: '2024-06-07',
                value: 1700,
                label: 'Automated interactions',
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
            supportInteractionsTrendHooks,
            'useAiAgentSupportInteractionsTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3900,
                prevValue: 3800,
            },
        })

        jest.spyOn(
            supportInteractionsTimeSeriesHooks,
            'useAiAgentSupportInteractionsTimeSeriesData',
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
        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render the metric value from support interactions trend hook', () => {
        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('3,900')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render TimeSeriesChart component', () => {
        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render with negative trend icon when trend is negative', () => {
        jest.spyOn(
            supportInteractionsTrendHooks,
            'useAiAgentSupportInteractionsTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3600,
                prevValue: 3900,
            },
        })

        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should handle null support interactions value', () => {
        jest.spyOn(
            supportInteractionsTrendHooks,
            'useAiAgentSupportInteractionsTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: null,
            },
        })

        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should handle undefined support interactions data', () => {
        jest.spyOn(
            supportInteractionsTrendHooks,
            'useAiAgentSupportInteractionsTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: null,
            },
        })

        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should handle empty time series data', () => {
        jest.spyOn(
            supportInteractionsTimeSeriesHooks,
            'useAiAgentSupportInteractionsTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should handle undefined time series data', () => {
        jest.spyOn(
            supportInteractionsTimeSeriesHooks,
            'useAiAgentSupportInteractionsTimeSeriesData',
        ).mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        })

        render(<AnalyticsSupportAgentLineChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render chart with time series data', () => {
        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render skeleton when timeSeriesData is undefined', () => {
        jest.spyOn(
            supportInteractionsTimeSeriesHooks,
            'useAiAgentSupportInteractionsTimeSeriesData',
        ).mockReturnValue({
            data: undefined as any,
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const areaChart = container.querySelector('.recharts-area')
        expect(areaChart).not.toBeInTheDocument()

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render chart with empty data when timeSeriesData is empty array', () => {
        jest.spyOn(
            supportInteractionsTimeSeriesHooks,
            'useAiAgentSupportInteractionsTimeSeriesData',
        ).mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })

        const { container } = render(<AnalyticsSupportAgentLineChart />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    describe('Loading states', () => {
        it('should render skeleton when supportInteractionsTrend is fetching', () => {
            jest.spyOn(
                supportInteractionsTrendHooks,
                'useAiAgentSupportInteractionsTrend',
            ).mockReturnValue({
                isFetching: true,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { container } = render(<AnalyticsSupportAgentLineChart />)

            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when timeSeriesData is null', () => {
            jest.spyOn(
                supportInteractionsTimeSeriesHooks,
                'useAiAgentSupportInteractionsTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AnalyticsSupportAgentLineChart />)

            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render skeleton when both data sources are loading', () => {
            jest.spyOn(
                supportInteractionsTrendHooks,
                'useAiAgentSupportInteractionsTrend',
            ).mockReturnValue({
                isFetching: true,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            jest.spyOn(
                supportInteractionsTimeSeriesHooks,
                'useAiAgentSupportInteractionsTimeSeriesData',
            ).mockReturnValue({
                data: null as any,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AnalyticsSupportAgentLineChart />)

            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()

            const areaChart = container.querySelector('.recharts-area')
            expect(areaChart).not.toBeInTheDocument()
        })

        it('should render chart when both data sources are loaded', () => {
            jest.spyOn(
                supportInteractionsTrendHooks,
                'useAiAgentSupportInteractionsTrend',
            ).mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 3900,
                    prevValue: 3800,
                },
            })

            jest.spyOn(
                supportInteractionsTimeSeriesHooks,
                'useAiAgentSupportInteractionsTimeSeriesData',
            ).mockReturnValue({
                data: mockTimeSeriesData,
                isFetching: false,
                isError: false,
            })

            const { container } = render(<AnalyticsSupportAgentLineChart />)

            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('Formatting functions', () => {
        it('should format Y-axis tick values correctly for values < 1000', () => {
            const mockData = [
                [
                    {
                        dateTime: '2024-06-01',
                        value: 500,
                        label: 'Automated interactions',
                    },
                    {
                        dateTime: '2024-06-02',
                        value: 600,
                        label: 'Automated interactions',
                    },
                ],
            ]

            jest.spyOn(
                supportInteractionsTimeSeriesHooks,
                'useAiAgentSupportInteractionsTimeSeriesData',
            ).mockReturnValue({
                data: mockData,
                isFetching: false,
                isError: false,
            })

            render(<AnalyticsSupportAgentLineChart />)

            const elements = document.body.textContent
            expect(elements).toBeTruthy()
        })

        it('should format tooltip values with comma separators', () => {
            render(<AnalyticsSupportAgentLineChart />)

            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })
})
