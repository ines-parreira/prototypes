import {renderHook} from '@testing-library/react-hooks'

import {logEvent, SegmentEvent} from 'common/segment'
import {useCustomReportData} from 'hooks/reporting/custom-reports/useCustomReportData'
import {useDownloadCustomReportData} from 'hooks/reporting/custom-reports/useDownloadCustomReportData'
import {
    CustomReportChartSchema,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {saveZippedFiles} from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/custom-reports/useCustomReportData')
const useCustomReportDataMock = assumeMock(useCustomReportData)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('useDownloadCustomReportData', () => {
    const trendChartId = OverviewChart.MessagesPerTicketTrendCard
    const trendChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: trendChartId,
    }
    const timeSeriesChartId = OverviewChart.MessagesSentGraph
    const timeSeriesChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: timeSeriesChartId,
    }
    const reportRow: CustomReportRowSchema = {
        type: CustomReportChildType.Row,
        children: [trendChart, timeSeriesChart],
    }
    const exampleCustomReport: CustomReportSchema = {
        analytics_filter_id: 0,
        children: [reportRow],
        id: 0,
        name: 'Some report name',
        emoji: null,
    }
    const files = {}
    const fileName = 'someName'
    beforeEach(() => {
        useCustomReportDataMock.mockReturnValue({
            isLoading: false,
            files,
            fileName,
        })
    })

    it('should download a zipped file', async () => {
        const {result} = renderHook(() =>
            useDownloadCustomReportData(exampleCustomReport)
        )
        await result.current.triggerDownload()

        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
    })

    it('should call useCustomReportData with empty report', async () => {
        const {result} = renderHook(() =>
            useDownloadCustomReportData(undefined)
        )
        await result.current.triggerDownload()

        expect(useCustomReportDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 0,
                children: [],
            })
        )
    })

    it('should log Segment event', async () => {
        const {result} = renderHook(() =>
            useDownloadCustomReportData(exampleCustomReport)
        )
        await result.current.triggerDownload()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })
})
