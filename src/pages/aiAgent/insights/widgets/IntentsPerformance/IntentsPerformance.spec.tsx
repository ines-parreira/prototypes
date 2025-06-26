import React from 'react'

import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGridSize } from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { assumeMock } from 'utils/testing'

import { IntentsPerformance } from './IntentsPerformance'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
jest.mock('hooks/useGridSize', () => ({
    useGridSize: jest.fn(),
}))
jest.mock('hooks/useLocalStorage', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => jest.fn())

const mockUseStatsFilters = useStatsFilters as jest.Mock
const mockUseGridSize = assumeMock(useGridSize) as jest.Mock
const mockUseLocalStorage = assumeMock(useLocalStorage) as jest.Mock
const mockUseAppDispatch = assumeMock(useAppDispatch) as jest.Mock

// Set default values
const period = {
    start_datetime: new Date(
        new Date().setDate(new Date().getDate() - 7),
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
        data: { value: 0.3, prevValue: 0.27 },
    },
    interpretAs,
    metricFormat: 'decimal-to-percent' as MetricTrendFormat,
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
        data: { value: 420, prevValue: 450 },
    },
    interpretAs,
    tip: <div>Automated interactions tip</div>,
}

const metric3 = {
    title: 'Success rate',
    hint: {
        title: 'Success rate hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: { value: 0.16, prevValue: 0.14 },
    },
    interpretAs,
    metricFormat: 'decimal-to-percent' as MetricTrendFormat,
    tip: <div>Success rate tip</div>,
}

const metric4 = {
    title: 'Customer satisfaction',
    hint: {
        title: 'Customer satisfaction hint',
    },
    trend: {
        isFetching: false,
        isError: false,
        data: { value: 3.5, prevValue: 2.5 },
    },
    interpretAs,
    metricFormat: 'decimal' as MetricTrendFormat,
    tip: <div>Customer satisfaction tip</div>,
}

describe('IntentsPerformance', () => {
    beforeEach(() => {
        mockUseStatsFilters.mockReturnValue({})
        mockUseGridSize.mockReturnValue(() => 3)
        mockUseLocalStorage.mockReturnValue([true, jest.fn()])
        mockUseAppDispatch.mockReturnValue(() => null)
    })

    it('renders the component correctly', () => {
        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                period={period}
                metrics={[metric1, metric2, metric3, metric4]}
            />,
        )

        expect(screen.getByText('Title of the section')).toBeInTheDocument()

        expect(screen.getByText('Coverage rate')).toBeInTheDocument()
        expect(screen.getByText('30%')).toBeInTheDocument()

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('420')).toBeInTheDocument()

        expect(screen.getByText('Success rate')).toBeInTheDocument()
        expect(screen.getByText('16%')).toBeInTheDocument()

        expect(screen.getByText('Customer satisfaction')).toBeInTheDocument()
        expect(screen.getByText('3.5')).toBeInTheDocument()
    })

    it('renders subtitle correctly if subtitle is provided and display tips CTA is not set', () => {
        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                period={period}
                metrics={[metric1, metric2, metric3, metric4]}
                sectionSubtitle="Subtitle of the section"
            />,
        )

        expect(screen.getByText('Subtitle of the section')).toBeInTheDocument()
    })

    it('only renders a TrendBadge when previous value is available', () => {
        const { container } = render(
            <IntentsPerformance
                sectionTitle="Title of the section"
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
                            data: { value: 3.5, prevValue: null },
                        },
                    },
                ]}
            />,
        )

        expect(container.querySelectorAll('[id^="badge-"]')).toHaveLength(3)
    })

    it('renders a loading state when data is fetching', () => {
        const { container } = render(
            <IntentsPerformance
                sectionTitle="Title of the section"
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
            />,
        )

        expect(
            container.getElementsByClassName('react-loading-skeleton'),
        ).toHaveLength(2)
    })

    it('renders a placeholder when data is unavailable', () => {
        render(
            <IntentsPerformance
                sectionTitle="Title of the section"
                period={period}
                metrics={[
                    {
                        ...metric1,
                        trend: {
                            isFetching: false,
                            isError: false,
                            data: { value: null, prevValue: null },
                        },
                    },
                ]}
            />,
        )

        expect(screen.getByText('-')).toBeInTheDocument()
    })
})
