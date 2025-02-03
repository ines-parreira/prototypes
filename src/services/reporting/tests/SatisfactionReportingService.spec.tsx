import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {fetchSurveyScores} from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'

import {formatMetricValue} from 'pages/stats/common/utils'
import {formatSurveyScores} from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {
    fetchSurveyScoresReportData,
    SATISFACTION_METRICS_FILE_NAME,
    SATISFACTION_TRENDS_METRICS_FILE_NAME,
    saveReport,
    useSatisfactionReportData,
} from 'services/reporting/satisfactionReportingService'
import {SatisfactionMetric} from 'state/ui/stats/types'
import {createCsv} from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
)
const useSatisfactionMetricsMock = assumeMock(useSatisfactionMetrics)
jest.mock('hooks/reporting/quality-management/satisfaction/useSurveyScores')
const fetchSurveyScoresMock = assumeMock(fetchSurveyScores)

describe('satisfactionReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )
    const userTimezone = 'UTC'
    const defaultData = {
        satisfactionScoreTrend: {data: undefined},
        responseRateTrend: {data: undefined},
        surveysSentTrend: {data: undefined},
        averageScoreTrend: {data: undefined},
        surveyScores: {data: undefined},
    } as any
    const fileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_METRICS_FILE_NAME
    )
    const trendsFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME
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
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '1'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '2'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '3'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '4'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '5'},
            ],
        },
    }
    const headers = [
        'Metric',
        `${startDate} - ${endDate}`,
        `${previousStartDate} - ${previousEndDate}`,
    ]
    const formattedExampleSurveyScoresData = formatSurveyScores(
        exampleSurveyScoresData,
        '- star count'
    ).map(({value, label}) => [label, value])

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
                            ].metricFormat
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.AverageSurveyScore
                            ].metricFormat
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
                            ].metricFormat
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SatisfactionScore
                            ].metricFormat
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
                            ].metricFormat
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.ResponseRate
                            ].metricFormat
                        ),
                    ],
                    [
                        SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                            .title,
                        formatMetricValue(
                            exampleTrendData.data.value,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SurveysSent
                            ].metricFormat
                        ),
                        formatMetricValue(
                            exampleTrendData.data.prevValue,
                            SatisfactionMetricConfig[
                                SatisfactionMetric.SurveysSent
                            ].metricFormat
                        ),
                    ],
                ])
            )
        })
    })

    describe('fetchSurveyScoresReportData', () => {
        beforeEach(() => {
            fetchSurveyScoresMock.mockResolvedValue(exampleSurveyScoresData)
        })

        it('should fetch and format Survey scores report', async () => {
            const result = await fetchSurveyScoresReportData(
                {period},
                userTimezone
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
                {period},
                userTimezone
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
        useSatisfactionMetricsMock.mockReturnValue({
            reportData: defaultData,
            isLoading: false,
            period,
        })

        const {result} = renderHook(() => useSatisfactionReportData())

        expect(result.current).toEqual({
            files: {
                [trendsFileName]: saveReport(defaultData, period),
            },
            fileName,
            isLoading: false,
        })
    })
})
