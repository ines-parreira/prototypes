import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'

jest.mock('utils/file')

const reportData = {
    value: 1,
    allData: [],
}

const buildQuery = <T>(isFetching: boolean, data: T) => ({
    isFetching,
    data,
    isError: false,
})

describe('agentsPerformanceReportingService', () => {
    const baseMetrics = {
        closedTicketsMetric: buildQuery(false, reportData),
        customerSatisfactionMetric: buildQuery(false, reportData),
        firstResponseTimeMetric: buildQuery(false, reportData),
        messagesSentMetric: buildQuery(false, reportData),
        percentageOfClosedTicketsMetric: buildQuery(false, reportData),
        resolutionTimeMetric: buildQuery(false, reportData),
        ticketsRepliedMetric: buildQuery(false, reportData),
    }
    const data: Parameters<typeof saveReport>[0] = {
        agents: [],
        ...baseMetrics,
    }
    const summaryData: Parameters<typeof saveReport>[1] = {
        ...baseMetrics,
    }

    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }

    it('should call saveReport with a report', async () => {
        const fakeReport = 'someValue'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(data, summaryData, period)

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-agents-metrics-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    fakeReport,
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-agents-metrics-${moment().format(DATE_TIME_FORMAT)}`
        )
    })
})
