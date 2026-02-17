import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { createCsv } from '@repo/utils'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useTables } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useSatisfactionMetrics } from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionMetrics'
import {
    fetchScoredSurveys,
    useScoredSurveys,
} from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import { fetchSurveyScores } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import { getFormattedInfo } from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils'
import { formatSurveyScores } from 'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import {
    fetchScoredSurveysReportData,
    fetchSurveyScoresReportData,
    formatScoredSurveysReport,
    SATISFACTION_METRICS_FILE_NAME,
    SATISFACTION_SCORED_SURVEYS,
    SATISFACTION_TRENDS_METRICS_FILE_NAME,
    saveReport,
    useSatisfactionReportData,
} from 'domains/reporting/services/satisfactionReportingService'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionMetrics',
)
const useSatisfactionMetricsMock = assumeMock(useSatisfactionMetrics)
jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores',
)
const fetchSurveyScoresMock = assumeMock(fetchSurveyScores)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys',
)
const fetchScoredSurveysMock = assumeMock(fetchScoredSurveys)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/utils',
)
const getLineChartFormattedInfoMock = assumeMock(getFormattedInfo)

jest.mock('domains/reporting/hooks/common/useTableReportData')
const useTablesMock = assumeMock(useTables)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys',
)
const useScoredSurveysMock = assumeMock(useScoredSurveys)

const mockStore = configureMockStore([thunk])

describe('satisfactionReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT,
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT,
    )
    const userTimezone = 'UTC'
    const defaultData = {
        satisfactionScoreTrend: { data: undefined },
        responseRateTrend: { data: undefined },
        surveysSentTrend: { data: undefined },
        averageScoreTrend: { data: undefined },
        surveyScores: { data: undefined },
    } as any
    const fileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_METRICS_FILE_NAME,
    )
    const trendsFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME,
    )

    const scoredSurveysFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_SCORED_SURVEYS,
    )
    const exampleTrendData = {
        isFetching: false,
        isError: false,
        data: {
            value: 12,
            prevValue: 4,
        },
    }
    const exampleSurveyScoresData = {
        isFetching: false,
        isError: false,
        data: {
            value: null,
            decile: null,
            allData: [
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '1' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '2' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '3' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '4' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '5' },
            ],
        },
    }

    const exampleScoredSurveysData = {
        isFetching: false,
        isError: false,
        data: [
            {
                ticketId: '123',
                surveyScore: '2',
                comment: "didn't understand the issue at all?",
                assignee: 'John Doe',
                customerName: 'Alice',
                surveyCustomerId: '602166910',
                surveyScoredDate: '2025-02-16T09:27:09.000',
            },
        ],
    }

    const headers = [
        'Metric',
        `${startDate} - ${endDate}`,
        `${previousStartDate} - ${previousEndDate}`,
    ]
    const formattedExampleSurveyScoresData = formatSurveyScores(
        exampleSurveyScoresData,
        '- star count',
    ).map(({ value, label }) => [label, value])

    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2023-08-01',
                    end_datetime: '2023-08-31',
                },
            },
        },
        ui: {
            stats: {
                filters: {
                    granularity: 'hour',
                    cleanStatsFilters: {
                        period: {
                            start_datetime: '2023-08-01',
                            end_datetime: '2023-08-31',
                        },
                    },
                    userTimezone: 'UTC',
                },
            },
        },
    }

    beforeEach(() => {
        getLineChartFormattedInfoMock.mockReturnValue({
            dataToRender: [
                [
                    { dateTime: '2023-08-01', value: 4.5 },
                    { dateTime: '2023-08-02', value: 4.7 },
                ],
            ],
            labels: ['Agent 1'],
            initialVisibility: {},
            tooltips: [],
        })
    })

    describe('saveReport', () => {
        it('should format data', () => {
            const data = {
                satisfactionScoreTrend: exampleTrendData,
                responseRateTrend: exampleTrendData,
                surveysSentTrend: exampleTrendData,
                averageScoreTrend: exampleTrendData,
                surveyScores: exampleSurveyScoresData,
            }
            const report = saveReport(data, period)

            expect(report).toEqual(
                createCsv([
                    headers,
                    [
                        SatisfactionMetricConfig[
                            SatisfactionMetric.AverageSurveyScore
                        ].title,
                        formatMetricValue(
                            exampleTrendData.data.value,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.AverageSurveyScore
                            ].metricFormat,
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.AverageSurveyScore
                            ].metricFormat,
                        ),
                    ],
                    ...formattedExampleSurveyScoresData,
                    [
                        SatisfactionMetricConfig[
                            SatisfactionMetric.SatisfactionScore
                        ].title,
                        formatMetricValue(
                            exampleTrendData.data.value,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SatisfactionScore
                            ].metricFormat,
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SatisfactionScore
                            ].metricFormat,
                        ),
                    ],
                    [
                        SatisfactionMetricConfig[
                            SatisfactionMetric.ResponseRate
                        ].title,
                        formatMetricValue(
                            exampleTrendData.data.value,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.ResponseRate
                            ].metricFormat,
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.ResponseRate
                            ].metricFormat,
                        ),
                    ],
                    [
                        SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                            .title,
                        formatMetricValue(
                            exampleTrendData.data.value,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SurveysSent
                            ].metricFormat,
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SurveysSent
                            ].metricFormat,
                        ),
                    ],
                ]),
            )
        })
    })

    describe('fetchSurveyScoresReportData', () => {
        beforeEach(() => {
            fetchSurveyScoresMock.mockResolvedValue(exampleSurveyScoresData)
        })

        it('should fetch and format Survey scores report', async () => {
            const result = await fetchSurveyScoresReportData(
                { period },
                userTimezone,
            )

            expect(result).toEqual({
                files: {
                    [trendsFileName]: createCsv([
                        headers,
                        ...formattedExampleSurveyScoresData,
                    ]),
                },
                fileName: trendsFileName,
                isError: false,
                isLoading: false,
            })
        })

        it('should return empty on error', async () => {
            fetchSurveyScoresMock.mockRejectedValue({})

            const result = await fetchSurveyScoresReportData(
                { period },
                userTimezone,
            )

            expect(result).toEqual({
                files: {},
                fileName: trendsFileName,
                isError: true,
                isLoading: false,
            })
        })
    })

    describe('useSatisfactionReportData', () => {
        beforeEach(() => {
            useScoredSurveysMock.mockReturnValue(exampleScoredSurveysData)
            useSatisfactionMetricsMock.mockReturnValue({
                reportData: defaultData,
                isLoading: false,
                period,
            })
            useTablesMock.mockReturnValue({
                files: {},
                isFetching: false,
            })
        })

        it('should return formatted report data', () => {
            const { result } = renderHook(() => useSatisfactionReportData(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            expect(result.current).toEqual({
                files: {
                    [trendsFileName]: saveReport(defaultData, period),
                    [scoredSurveysFileName]: formatScoredSurveysReport(
                        exampleScoredSurveysData.data,
                    ),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchScoredSurveysReportData', () => {
        const formattedExampleScoredSurveyData = formatScoredSurveysReport(
            exampleScoredSurveysData.data,
        )

        beforeEach(() => {
            fetchScoredSurveysMock.mockResolvedValue(exampleScoredSurveysData)
        })

        it('should fetch and format Scored surveys report', async () => {
            const result = await fetchScoredSurveysReportData(
                { period },
                userTimezone,
            )

            const fileName = getCsvFileNameWithDates(
                period,
                SATISFACTION_SCORED_SURVEYS,
            )

            expect(result).toEqual({
                files: {
                    [fileName]: formattedExampleScoredSurveyData,
                },
                fileName: fileName,
                isError: false,
                isLoading: false,
            })
        })

        it('should return empty on error', async () => {
            fetchScoredSurveysMock.mockRejectedValue({})

            const result = await fetchSurveyScoresReportData(
                { period },
                userTimezone,
            )

            expect(result).toEqual({
                files: {},
                fileName: trendsFileName,
                isError: true,
                isLoading: false,
            })
        })
    })
})
