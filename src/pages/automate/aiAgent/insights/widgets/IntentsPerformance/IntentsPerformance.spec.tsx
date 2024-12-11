import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGridSize} from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'

import {MetricTrendFormat} from 'pages/stats/common/utils'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

import {IntentsPerformance} from './IntentsPerformance'

// Mock dependencies
jest.mock('hooks/reporting/support-performance/useNewStatsFilters', () => ({
    useNewStatsFilters: jest.fn(),
}))

jest.mock('hooks/useGridSize', () => ({
    useGridSize: jest.fn(),
}))

jest.mock('hooks/useLocalStorage', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => jest.fn())

const mockUseNewStatsFilters = useNewStatsFilters as jest.Mock
const mockUseGridSize = useGridSize as jest.Mock
const mockUseLocalStorage = useLocalStorage as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock

// Set default values
const period = {
    start_datetime: new Date(
        new Date().setDate(new Date().getDate() - 7)
    ).toISOString(),
    end_datetime: new Date().toISOString(),
}

const interpretAs = 'more-is-better' as const

const metric1 = {
    title: 'Coverage rate',
    hint: {
        title: 'Coverage rate hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: {value: 30, prevValue: 27},
    },
    interpretAs,
    metricFormat: 'percent' as MetricTrendFormat,
    tip: <div>Coverage rate tip</div>,
    drillDownMetric: OverviewMetric.TicketsClosed,
}

const metric2 = {
    title: 'Automated interactions',
    hint: {
        title: 'Automated interactions hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: {value: 420, prevValue: 450},
    },
    interpretAs,
    tip: <div>Automated interactions tip</div>,
}

const metric3 = {
    title: 'Automation rate',
    hint: {
        title: 'Automation rate hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: {value: 16, prevValue: 14},
    },
    interpretAs,
    metricFormat: 'percent' as MetricTrendFormat,
    tip: <div>Automation rate tip</div>,
}

const metric4 = {
    title: 'Customer satisfaction',
    hint: {
        title: 'Customer satisfaction hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: {value: 3.5, prevValue: 2.5},
    },
    interpretAs,
    metricFormat: 'decimal' as MetricTrendFormat,
    tip: <div>Customer satisfaction tip</div>,
}

describe('IntentsPerformance', () => {
    beforeEach(() => {
        mockUseNewStatsFilters.mockReturnValue({isAnalyticsNewFilters: true})
        mockUseGridSize.mockReturnValue(() => 3)
        mockUseLocalStorage.mockReturnValue([true, jest.fn()])
        mockUseAppDispatch.mockReturnValue(() => null)
    })

    it('renders the component correctly', () => {
        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={true}
                period={period}
                metrics={[metric1, metric2, metric3, metric4]}
            />
        )

        expect(screen.getByText('Title of the section')).toBeInTheDocument()

        expect(screen.getByText('Coverage rate')).toBeInTheDocument()
        expect(screen.getByText('30%')).toBeInTheDocument()

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('420')).toBeInTheDocument()

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
        expect(screen.getByText('16%')).toBeInTheDocument()

        expect(screen.getByText('Customer satisfaction')).toBeInTheDocument()
        expect(screen.getByText('3.5')).toBeInTheDocument()
    })

    it('shows hints correctly', () => {
        mockUseLocalStorage.mockReturnValue([true, jest.fn()])

        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={false}
                period={period}
                metrics={[metric1, metric2, metric3, metric4]}
            />
        )

        const toggleButton = screen.queryByRole('button')
        expect(toggleButton).not.toBeInTheDocument()

        expect(screen.getByText('Coverage rate tip')).toBeInTheDocument()
        expect(
            screen.getByText('Automated interactions tip')
        ).toBeInTheDocument()
        expect(screen.getByText('Automation rate tip')).toBeInTheDocument()
        expect(
            screen.getByText('Customer satisfaction tip')
        ).toBeInTheDocument()
    })

    it('hides hints correctly', () => {
        const mockSetAreTipsVisible = jest.fn()
        mockUseLocalStorage.mockReturnValue([false, mockSetAreTipsVisible])

        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={true}
                period={period}
                metrics={[metric1, metric2, metric3, metric4]}
            />
        )

        expect(screen.queryByText('Coverage rate tip')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Automated interactions tip')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Automation rate tip')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Customer satisfaction tip')
        ).not.toBeInTheDocument()

        const toggleButton = screen.getByRole('button')
        fireEvent.click(toggleButton)
        expect(mockSetAreTipsVisible).toHaveBeenCalledWith(true)
    })

    it('only renders a TrendBadge when previous value is available', () => {
        const {container} = render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={true}
                period={period}
                metrics={[
                    metric1,
                    metric2,
                    metric3,
                    {
                        ...metric4,
                        trend: {
                            isFetching: false,
                            isError: false,
                            data: {value: 3.5, prevValue: null},
                        },
                    },
                ]}
            />
        )

        expect(container.querySelectorAll('[id^="badge-"]')).toHaveLength(3)
    })

    it('renders a loading state when data is fetching', () => {
        const {container} = render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={true}
                period={period}
                metrics={[
                    {
                        ...metric1,
                        trend: {
                            isFetching: true,
                            isError: false,
                        },
                    },
                    {
                        ...metric2,
                        tip: undefined,
                        trend: {
                            isFetching: true,
                            isError: false,
                        },
                    },
                ]}
            />
        )

        expect(
            container.getElementsByClassName('react-loading-skeleton')
        ).toHaveLength(3)
    })

    it('renders a placeholder when data is unavailable', () => {
        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                shouldDisplayTipsCTA={true}
                period={period}
                metrics={[
                    {
                        ...metric1,
                        trend: {
                            isFetching: false,
                            isError: false,
                            data: {value: null, prevValue: null},
                        },
                    },
                ]}
            />
        )

        expect(screen.getByText('-')).toBeInTheDocument()
        expect(screen.getByText('No data')).toBeInTheDocument()
        expect(
            screen.getByText('No data available for the selected filters.')
        ).toBeInTheDocument()
    })
})
