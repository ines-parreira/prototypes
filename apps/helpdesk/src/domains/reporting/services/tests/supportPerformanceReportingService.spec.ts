import moment from 'moment'

import type { Period } from 'domains/reporting/models/stat/types'
import {
    MESSAGES_SENT_LABEL,
    OPEN_TICKETS_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'domains/reporting/services/constants'
import type { TimeSeriesDataWithLabels } from 'domains/reporting/services/supportPerformanceReportingService'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'
import * as files from 'utils/file'

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
const exampleTimeSeriesData = {
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

const exampleTrendReportResponse = buildQuery(false, trendReportData)
const exampleWorkloadPerChannelData = buildQuery(false, [oneDimensionalData])

const timeSeriesData: TimeSeriesDataWithLabels[] = [
    {
        label: 'someLabel',
        data: buildQuery(false, [[exampleTimeSeriesData]]).data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, [[exampleTimeSeriesData]]).data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, [[exampleTimeSeriesData]]).data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, [[exampleTimeSeriesData]]).data,
    },
]

const workloadDataSource = [
    {
        label: OPEN_TICKETS_LABEL,
        value: String(exampleTrendReportResponse.data?.value),
        prevValue: String(exampleTrendReportResponse.data?.prevValue),
    },
    {
        label: TICKETS_CREATED_LABEL,
        value: String(exampleTrendReportResponse.data?.value),
        prevValue: String(exampleTrendReportResponse.data?.prevValue),
    },
    {
        label: TICKETS_REPLIED_LABEL,
        value: String(exampleTrendReportResponse.data?.value),
        prevValue: String(exampleTrendReportResponse.data?.prevValue),
    },
    {
        label: TICKETS_CLOSED_LABEL,
        value: String(exampleTrendReportResponse.data?.value),
        prevValue: String(exampleTrendReportResponse.data?.prevValue),
    },
    {
        label: MESSAGES_SENT_LABEL,
        value: String(exampleTrendReportResponse.data?.value),
        prevValue: String(exampleTrendReportResponse.data?.prevValue),
    },
    ...(exampleWorkloadPerChannelData.data?.map((channelData) => ({
        label: `${WORKLOAD_BY_CHANNEL_LABEL} - ${channelData.label}`,
        value: String(channelData.value),
        prevValue: String(
            exampleWorkloadPerChannelData.data?.find(
                (row) => row.label === channelData.label,
            )?.value,
        ),
    })) || []),
]

const period = {
    start_datetime: '2023-06-07',
    end_datetime: '2023-06-14',
}

const timeSeriesDateTimeOverriddenByYesterdayDate = [
    [{ ...exampleTimeSeriesData, dateTime: YESTERDAY }],
]

const timeSeriesNoValue = [
    [
        {
            ...exampleTimeSeriesData,
            value: null,
        } as any,
    ],
]

const timeSeriesDataOverrides = [
    {
        label: 'someLabel',
        data: buildQuery(false, timeSeriesDateTimeOverriddenByYesterdayDate)
            .data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, timeSeriesDateTimeOverriddenByYesterdayDate)
            .data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, timeSeriesDateTimeOverriddenByYesterdayDate)
            .data,
    },
    {
        label: 'someLabel',
        data: buildQuery(false, timeSeriesNoValue).data,
    },
]

const testDataFactory = (
    data: TimeSeriesDataWithLabels[],
    period: Period,
    testName: string | undefined = '',
) => {
    return {
        data,
        period,
        testName,
    }
}

const testData = [
    testDataFactory(
        timeSeriesData,
        period,
        'Overridden time series report data',
    ),
    testDataFactory(
        timeSeriesDataOverrides,
        period,
        'Overridden one dimensional report data',
    ),
]

describe('supportPerformanceReportingService', () => {
    describe('createTimeSeriesReport', () => {
        it.each(testData)(
            'should call saveReport with a report $testName',
            ({ data }) => {
                const fakeReport = 'someValue'
                const fileName = 'some-name'
                jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)

                const result = createTimeSeriesReport(data, fileName)

                expect(result).toEqual({
                    files: {
                        [fileName]: fakeReport,
                    },
                })
            },
        )

        it('should return empty object when no data provided', () => {
            const fakeReport = 'someValue'
            const fileName = 'some-name'
            const data = testDataFactory([], period, 'No data').data
            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)

            const result = createTimeSeriesReport(data, fileName)

            expect(result).toEqual({
                files: {},
            })
        })
    })

    describe('createTrendReport', () => {
        const fileName = 'some-name'

        it('should call saveTrendReport with a report', () => {
            const fakeReport = 'someValue'

            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)

            const result = createTrendReport(workloadDataSource, fileName)

            expect(result).toEqual({
                files: {
                    [fileName]: fakeReport,
                },
            })
        })

        it('should return empty files object when no data provided', () => {
            const result = createTrendReport([], fileName)

            expect(result).toEqual({
                files: {},
            })
        })
    })
})
