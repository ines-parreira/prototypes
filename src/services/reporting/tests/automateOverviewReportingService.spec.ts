import moment from 'moment'
import {renderHook} from '@testing-library/react-hooks'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {
    AUTOMATE_IMPACT_FILENAME,
    AUTOMATE_PERFORMANCE_FEATURE_FILENAME,
    AUTOMATE_PERFORMANCE_FILENAME,
    OVERVIEW_METRICS_FILENAME,
    saveReport,
} from 'services/reporting/automateOverviewReportingService'
import {useAutomateStatsMeasureLabelMap} from 'hooks/reporting/automate/useAutomateStatsMeasureLabelMap'

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
        automationRateTimeSeries: [[timeSeriesData]],
        automatedInteractionTimeSeries: [[timeSeriesData]],
        automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
    }
    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }

    it('should call saveReport with a report', async () => {
        const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())
        const automateStatsMeasureLabelMap = result.current

        const fakeReport = 'someValue'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(data, period, automateStatsMeasureLabelMap)

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
        const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())
        const automateStatsMeasureLabelMap = result.current
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
                    automatedInteractionTimeSeries: [],
                    automatedInteractionByEventTypesTimeSeries: [],
                },
            },
            period,
            automateStatsMeasureLabelMap
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
