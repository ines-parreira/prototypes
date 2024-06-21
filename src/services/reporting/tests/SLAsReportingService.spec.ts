import moment from 'moment'
import {ReportingGranularity} from 'models/reporting/types'
import {Period} from 'models/stat/types'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {
    SLAsReportData,
    saveReport,
} from 'services/reporting/SLAsReportingService'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'

jest.mock('utils/file')

type TrendReportData = {
    prevValue: number
    value: number | null
}
const YESTERDAY = moment().subtract(1, 'day').toISOString()
const TODAY = moment().toISOString()
const granularity = ReportingGranularity.Day

const trendReportData: TrendReportData = {
    prevValue: 1,
    value: 2,
}
const timeSeriesData = {
    dateTime: TODAY,
    value: 4,
    label: TicketSLAStatus.Breached,
}

const buildQueryResponse = <T>(isFetching: boolean, data: T) => ({
    isFetching,
    data,
    isError: false,
})

const data: SLAsReportData = {
    slaAchievementRateTrend: buildQueryResponse(false, trendReportData),
    slaBreachedTickets: buildQueryResponse(false, trendReportData),
    slaSatisfiedTickets: buildQueryResponse(false, trendReportData),
    achievedOrBreachedSLAsTicketsTimeSeries: {
        data: {
            [TicketSLAStatus.Breached]: [[timeSeriesData]],
            [TicketSLAStatus.Pending]: [[timeSeriesData]],
            [TicketSLAStatus.Satisfied]: [[timeSeriesData]],
        },
    },
}

const emptyData: SLAsReportData = {
    slaAchievementRateTrend: buildQueryResponse(false, undefined),
    slaBreachedTickets: buildQueryResponse(false, undefined),
    slaSatisfiedTickets: buildQueryResponse(false, undefined),
    achievedOrBreachedSLAsTicketsTimeSeries: {
        data: {
            [TicketSLAStatus.Breached]: [[]],
            [TicketSLAStatus.Pending]: [[]],
            [TicketSLAStatus.Satisfied]: [[]],
        },
    },
}

const period = {
    start_datetime: '2023-06-07',
    end_datetime: '2023-06-14',
}

const timeSeriesDateTimeOverriddenByYesterdayDate = [
    [{...timeSeriesData, dateTime: YESTERDAY}],
]

const timeSeriesDataOverrides = {
    achievedOrBreachedSLAsTicketsTimeSeries: {
        data: {
            [TicketSLAStatus.Breached]: buildQueryResponse(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data,
            [TicketSLAStatus.Pending]: buildQueryResponse(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data,

            [TicketSLAStatus.Satisfied]: buildQueryResponse(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data,
        },
    },
}

const testDataFactory = (
    data: SLAsReportData,
    dataOverrides: Partial<SLAsReportData> | undefined = {},
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
    testDataFactory(emptyData, undefined, period, 'Empty data'),
    testDataFactory(data, undefined, period, 'Default report data'),
    testDataFactory(
        data,
        {...timeSeriesDataOverrides},
        period,
        'Overridden time series report data'
    ),
]

describe('reporting', () => {
    it.each(testData)(
        'should call saveReport with a report $testName',
        async ({data, period}) => {
            const fakeReport = 'someValue'
            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
            const zipperMock = jest.spyOn(files, 'saveZippedFiles')

            await saveReport(data, period, granularity)

            expect(zipperMock).toHaveBeenCalledWith(
                {
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-overview-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                        fakeReport,
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-tickets-in-policy-${moment().format(
                        DATE_TIME_FORMAT
                    )}.csv`]: fakeReport,
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-trend-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                        fakeReport,
                },
                `${period.start_datetime}_${
                    period.end_datetime
                }-sla-report-${moment().format(DATE_TIME_FORMAT)}`
            )
        }
    )
})
