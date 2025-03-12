import React from 'react'

import { render, screen } from '@testing-library/react'
import moment from 'moment'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { logEvent, SegmentEvent } from 'common/segment'
import { useSurveyScores } from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters } from 'models/stat/types'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import AverageSurveyScoreDonutChart from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import { SatisfactionAverageSurveyScoreMetric } from 'state/ui/stats/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('hooks/reporting/quality-management/satisfaction/useSurveyScores')
const mockUseSurveyScores = assumeMock(useSurveyScores)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('pages/stats/common/components/charts/DonutChart/DonutChart')
const DonutChartMock = assumeMock(DonutChart)

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

const periodStart = formatReportingQueryDate(moment())
const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
const statsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: periodStart,
        end_datetime: periodEnd,
    },
}
const timezone = 'UTC'

const renderComponent = () => {
    render(<AverageSurveyScoreDonutChart />)
}

describe('<AverageSurveyScoreDonutChart/>', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        DonutChartMock.mockImplementation(() => <div>Donut Chart</div>)
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        mockUseSurveyScores.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [TicketSatisfactionSurveyMeasure.ScoredSurveysCount]:
                            '10',
                        [TicketSatisfactionSurveyDimension.SurveyScore]: '5',
                    },
                    {
                        [TicketSatisfactionSurveyMeasure.ScoredSurveysCount]:
                            '5',
                        [TicketSatisfactionSurveyDimension.SurveyScore]: '4',
                    },
                    {
                        [TicketSatisfactionSurveyMeasure.ScoredSurveysCount]:
                            '3',
                        [TicketSatisfactionSurveyDimension.SurveyScore]: '3',
                    },
                    {
                        [TicketSatisfactionSurveyMeasure.ScoredSurveysCount]:
                            '1',
                        [TicketSatisfactionSurveyDimension.SurveyScore]: '2',
                    },
                    {
                        [TicketSatisfactionSurveyMeasure.ScoredSurveysCount]:
                            '1',
                        [TicketSatisfactionSurveyDimension.SurveyScore]: '1',
                    },
                ],
            },
        })
    })

    it('should render AverageSurveyScoreDonutChart', () => {
        renderComponent()

        expect(screen.getByText('Average CSAT')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
        expect(screen.getByText('Donut Chart')).toBeInTheDocument()
        expect(DonutChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    {
                        label: '1 ★',
                        value: 1,
                    },
                    {
                        label: '2 ★',
                        value: 1,
                    },
                    {
                        label: '3 ★',
                        value: 3,
                    },
                    {
                        label: '4 ★',
                        value: 5,
                    },
                    {
                        label: '5 ★',
                        value: 10,
                    },
                ],
            }),
            {},
        )
    })

    it('should show no data state', () => {
        mockUseSurveyScores.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: null, decile: null, allData: [] },
        })

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText('Try adjusting filters to get results.'),
        ).toBeInTheDocument()
    })

    it('should show loading state when fetching data', () => {
        mockUseSurveyScores.mockReturnValue({
            isFetching: true,
            isError: false,
            data: null,
        })

        renderComponent()

        expect(DonutChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('should pass correct custom colors to DonutChart', () => {
        renderComponent()

        expect(DonutChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                customColors: [
                    analyticsColorsModern.analytics.data.pink.value,
                    analyticsColorsModern.analytics.data.yellow.value,
                    analyticsColorsModern.analytics.data.brown.value,
                    analyticsColorsModern.analytics.data.blue.value,
                    analyticsColorsModern.analytics.data.indigo.value,
                ],
            }),
            {},
        )
    })

    it('should pass default data and customColors when data does not exists', () => {
        mockUseSurveyScores.mockReturnValue({
            isFetching: false,
            isError: false,
            data: null,
        })

        renderComponent()

        expect(screen.getByText('Donut Chart')).toBeInTheDocument()
        expect(DonutChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [],
                customColors: [],
            }),
            {},
        )
    })

    it('should dispatch correct metric and log event when segment is clicked', () => {
        const mockDispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(mockDispatch)

        renderComponent()

        const { onSegmentClick } = DonutChartMock.mock.calls[0][0] as any

        expect(onSegmentClick).toBeDefined()

        onSegmentClick(1)

        expect(mockDispatch).toHaveBeenCalledWith({
            payload: {
                metricName:
                    SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo,
                title: 'Average CSAT',
            },
            type: 'drillDown/setMetricData',
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            payload: true,
            type: 'drillDown/setShouldUseNewFilterData',
        })

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatClicked, {
            metric: SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo,
        })
    })
})
