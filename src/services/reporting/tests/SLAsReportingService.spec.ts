import moment from 'moment'
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

const trendReportData: TrendReportData = {
    prevValue: 1,
    value: 2,
}
const timeSeriesData = {
    dateTime: TODAY,
    value: 4,
    label: TicketSLAStatus.Breached,
}

const buildQuery = <T>(isFetching: boolean, data?: T) => ({
    isFetching,
    data,
    isError: false,
})

const data: SLAsReportData = {
    slaAchievementRateTrend: buildQuery(false, trendReportData),
    slaBreachedTickets: buildQuery(false, trendReportData),
    slaSatisfiedTickets: buildQuery(false, trendReportData),
    slaPendingTickets: buildQuery(false, trendReportData),
    achievedOrBreachedSLAsTicketsTimeSeries: {
        data: {
            [TicketSLAStatus.Breached]: [
                [buildQuery(false, timeSeriesData).data!],
            ],
            [TicketSLAStatus.Pending]: [
                [buildQuery(false, timeSeriesData).data!],
            ],
            [TicketSLAStatus.Satisfied]: [
                [buildQuery(false, timeSeriesData).data!],
            ],
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
            [TicketSLAStatus.Breached]: buildQuery(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data!,
            [TicketSLAStatus.Pending]: buildQuery(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data!,

            [TicketSLAStatus.Satisfied]: buildQuery(
                false,
                timeSeriesDateTimeOverriddenByYesterdayDate
            ).data!,
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

            await saveReport(data, period)

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
