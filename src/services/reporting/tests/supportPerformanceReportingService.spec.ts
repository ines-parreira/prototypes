import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'

jest.mock('utils/file')

const trendReportData = {
    prevValue: 1,
    value: 2,
}
const timeSeriesData = {
    dateTime: moment().toISOString(),
    value: 4,
}
const oneDimensionalData = {
    label: 'some string',
    value: 3,
}

const buildQuery = <T>(isFetching: boolean, data: T) => ({
    isFetching,
    data,
    isError: false,
})

describe('reporting', () => {
    const data: Parameters<typeof saveReport>[0] = {
        customerSatisfactionTrend: buildQuery(false, trendReportData),
        firstResponseTimeTrend: buildQuery(false, trendReportData),
        resolutionTimeTrend: buildQuery(false, trendReportData),
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

    it('should call saveReport with a report', async () => {
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
    })
})
