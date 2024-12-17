import moment from 'moment'

import {formatMetricValue} from 'pages/stats/common/utils'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/satisfactionReportingService'
import {SatisfactionMetric} from 'state/ui/stats/types'
import * as files from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'

jest.mock('utils/file')

describe('satisfactionReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const previousPeriod = getPreviousPeriod(period)
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )
    const periodPrefix = `${startDate}_${endDate}`

    const defaultData = {
        satisfactionScoreTrend: {data: undefined},
        responseRateTrend: {data: undefined},
        surveysSentTrend: {data: undefined},
    } as any

    it('should zip the report', async () => {
        const fakeData = 'fakeReport1'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeData)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(defaultData, period)

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${periodPrefix}-satisfaction-trends-metrics-${export_datetime}.csv`]:
                    fakeData,
            },
            `${periodPrefix}-satisfaction-metrics-${export_datetime}`
        )
    })

    it('should format data', async () => {
        const createCsvSpy = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue('fakeReport1')

        const exampleTrendData = {
            isFetching: false,
            isError: false,
            data: {
                value: 12,
                prevValue: 4,
            },
        }

        const data = {
            satisfactionScoreTrend: exampleTrendData,
            responseRateTrend: exampleTrendData,
            surveysSentTrend: exampleTrendData,
        }
        await saveReport(data, period)

        const headers = [
            'Metric',
            `${startDate} - ${endDate}`,
            `${previousStartDate} - ${previousEndDate}`,
        ]
        expect(createCsvSpy).toHaveBeenCalledWith([
            headers,
            [
                SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]
                    .title,
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
                SatisfactionMetricConfig[SatisfactionMetric.ResponseRate].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]
                        .metricFormat
                ),
            ],
            [
                SatisfactionMetricConfig[SatisfactionMetric.SurveysSent].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                        .metricFormat
                ),
            ],
        ])
    })
})
