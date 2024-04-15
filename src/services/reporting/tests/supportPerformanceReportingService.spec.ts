import moment from 'moment'
import {Period} from 'models/stat/types'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {
    SupportPerformanceReportData,
    saveReport,
} from 'services/reporting/supportPerformanceReportingService'

jest.mock('utils/file')

type TrendReportData = {
    prevValue: number
    value: number | null
}
const YESTERDAY = moment().subtract(1, 'day').toISOString()
const TODAY = moment().toISOString()

const trendReportData: TrendReportData = {
    prevValue: 1,
    value: 2,
}
const timeSeriesData = {
    dateTime: TODAY,
    value: 4,
}
const oneDimensionalData = {
    label: 'some string',
    value: 3,
}

const buildQuery = <T>(isFetching: boolean, data?: T) => ({
    isFetching,
    data,
    isError: false,
})

const data: SupportPerformanceReportData = {
    customerSatisfactionTrend: buildQuery(false, trendReportData),
    medianFirstResponseTimeTrend: buildQuery(false, trendReportData),
    medianResolutionTimeTrend: buildQuery(false, trendReportData),
    messagesPerTicketTrend: buildQuery(false, trendReportData),
    openTicketsTrend: buildQuery(false, trendReportData),
    closedTicketsTrend: buildQuery(false, trendReportData),
    ticketsCreatedTrend: buildQuery(false, trendReportData),
    ticketsRepliedTrend: buildQuery(false, trendReportData),
    messagesSentTrend: buildQuery(false, trendReportData),
    ticketsCreatedTimeSeries: buildQuery(false, [[timeSeriesData]]),
    ticketsClosedTimeSeries: buildQuery(false, [[timeSeriesData]]),
    ticketsRepliedTimeSeries: buildQuery(false, [[timeSeriesData]]),
    messagesSentTimeSeries: buildQuery(false, [[timeSeriesData]]),
    workloadPerChannel: buildQuery(false, [oneDimensionalData]),
    workloadPerChannelPrevious: buildQuery(false, [oneDimensionalData]),
}

const period = {
    start_datetime: '2023-06-07',
    end_datetime: '2023-06-14',
}

const timeSeriesDateTimeOverriddenByYesterdayDate = [
    [{...timeSeriesData, dateTime: YESTERDAY}],
]

const timeSeriesNoValue = [
    [
        {
            ...timeSeriesData,
            value: null,
        } as any,
    ],
]

const timeSeriesDataOverrides = {
    ticketsClosedTimeSeries: buildQuery(
        false,
        timeSeriesDateTimeOverriddenByYesterdayDate
    ),
    ticketsRepliedTimeSeries: buildQuery(
        false,
        timeSeriesDateTimeOverriddenByYesterdayDate
    ),
    messagesSentTimeSeries: buildQuery(
        false,
        timeSeriesDateTimeOverriddenByYesterdayDate
    ),
    ticketsCreatedTimeSeries: buildQuery(false, timeSeriesNoValue),
}

const oneDimensionalDataLabelOverride = {
    workloadPerChannelPrevious: buildQuery(false, [
        {
            label: 'alternate string',
            value: oneDimensionalData.value,
        },
    ]),
}

const emptyOneDimensionalDataOverrides = {
    workloadPerChannel: buildQuery(false, undefined),
    ticketsCreatedTimeSeries: buildQuery(false, undefined),
}

const testDataFactory = (
    data: SupportPerformanceReportData,
    dataOverrides: Partial<SupportPerformanceReportData> | undefined = {},
    period: Period,
    testName: string | undefined = ''
) => {
    const testData = {...data, ...dataOverrides}
    return {
        data: testData,
        period,
        testName,
    }
}

const testData = [
    testDataFactory(data, undefined, period, 'Default report data'),
    testDataFactory(
        data,
        {...timeSeriesDataOverrides, ...oneDimensionalDataLabelOverride},
        period,
        'Overridden time series report data'
    ),
    testDataFactory(
        data,
        emptyOneDimensionalDataOverrides,
        period,
        'Overridden one dimensional report data'
    ),
]

describe('reporting', () => {
    it.each(testData)(
        'should call saveReport with a report $testName',
        async ({data, period}) => {
            const fakeReport = 'someValue'
            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
            const zipperMock = jest.spyOn(files, 'saveZippedFiles')

            await saveReport(data, period)

            expect(zipperMock).toHaveBeenCalledWith(
                {
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-customer-experience-${moment().format(
                        DATE_TIME_FORMAT
                    )}.csv`]: fakeReport,
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-ticket-volume-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                        fakeReport,
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-workload-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                        fakeReport,
                },
                `${period.start_datetime}_${
                    period.end_datetime
                }-overview-metrics-${moment().format(DATE_TIME_FORMAT)}`
            )
        }
    )
})
