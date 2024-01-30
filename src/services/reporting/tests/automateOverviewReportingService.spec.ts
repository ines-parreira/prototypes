import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {
    AUTOMATE_IMPACT_FILENAME,
    AUTOMATE_PERFORMANCE_FEATURE_FILENAME,
    AUTOMATE_PERFORMANCE_FILENAME,
    OVERVIEW_METRICS_FILENAME,
    saveReport,
} from 'services/reporting/automateOverviewReportingService'

jest.mock('utils/file')

const trendReportData = {
    prevValue: 1,
    value: 2,
}
const timeSeriesData = {
    dateTime: moment().toISOString(),
    value: 4,
}

const buildQuery = <T>(isFetching: boolean, data?: T) => ({
    isFetching,
    data,
    isError: false,
})

describe('reporting', () => {
    const data: Parameters<typeof saveReport>[0] = {
        firstResponseTimeTrend: buildQuery(false, trendReportData),
        decreaseInResolutionTimeWithAutomationTrend: buildQuery(
            false,
            trendReportData
        ),
        automationRateTrend: buildQuery(false, trendReportData),
        automatedInteractionTrend: buildQuery(false, trendReportData),
        automationRateTimeSeries: buildQuery(false, [[timeSeriesData]]),
        automatedInteractionTimeSeries: buildQuery(false, [[timeSeriesData]]),
        automatedInteractionByEventTypesTimeSeries: buildQuery(false, [
            [timeSeriesData],
        ]),
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
                }-${AUTOMATE_IMPACT_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
                [`${period.start_datetime}_${
                    period.end_datetime
                }-${AUTOMATE_PERFORMANCE_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
                [`${period.start_datetime}_${
                    period.end_datetime
                }-${AUTOMATE_PERFORMANCE_FEATURE_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-${OVERVIEW_METRICS_FILENAME}-${moment().format(DATE_TIME_FORMAT)}`
        )
    })

    it('should call saveReport with some base query values unset', async () => {
        const fakeReport = 'someValue'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(
            {
                ...data,
                ...{
                    resolutionTimeTrend: buildQuery(false, {
                        ...trendReportData,
                        value: null,
                    }),
                    automationRateTrend: buildQuery(false, {
                        ...trendReportData,
                        value: null,
                    }),
                    automatedInteractionTimeSeries: buildQuery(false),
                    automatedInteractionByEventTypesTimeSeries:
                        buildQuery(false),
                },
            },
            period
        )

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-${AUTOMATE_IMPACT_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
                [`${period.start_datetime}_${
                    period.end_datetime
                }-${AUTOMATE_PERFORMANCE_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
                [`${period.start_datetime}_${
                    period.end_datetime
                }-${AUTOMATE_PERFORMANCE_FEATURE_FILENAME}-${moment().format(
                    DATE_TIME_FORMAT
                )}.csv`]: fakeReport,
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-${OVERVIEW_METRICS_FILENAME}-${moment().format(DATE_TIME_FORMAT)}`
        )
    })
})
