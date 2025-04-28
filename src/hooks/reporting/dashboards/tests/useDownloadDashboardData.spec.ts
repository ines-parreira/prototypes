import { logEvent, SegmentEvent } from 'common/segment'
import { useDashboardData } from 'hooks/reporting/dashboards/useDashboardData'
import { useDownloadDashboardData } from 'hooks/reporting/dashboards/useDownloadDashboardData'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardRowSchema,
    DashboardSchema,
} from 'pages/stats/dashboards/types'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/dashboards/useDashboardData')
const useDashboardDataMock = assumeMock(useDashboardData)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('useDownloadDashboardData', () => {
    const trendChartId = OverviewChart.MessagesPerTicketTrendCard
    const trendChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: trendChartId,
    }
    const timeSeriesChartId = OverviewChart.MessagesSentGraph
    const timeSeriesChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: timeSeriesChartId,
    }
    const reportRow: DashboardRowSchema = {
        type: DashboardChildType.Row,
        children: [trendChart, timeSeriesChart],
    }
    const exampleDashboard: DashboardSchema = {
        analytics_filter_id: 0,
        children: [reportRow],
        id: 0,
        name: 'Some report name',
        emoji: null,
    }
    const files = {}
    const fileName = 'someName'
    beforeEach(() => {
        useDashboardDataMock.mockReturnValue({
            isLoading: false,
            files,
            fileName,
        })
    })

    it('should download a zipped file', async () => {
        const { result } = renderHook(() =>
            useDownloadDashboardData(exampleDashboard),
        )
        await result.current.triggerDownload()

        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
    })

    it('should call useDashboardData with empty report', async () => {
        const { result } = renderHook(() => useDownloadDashboardData(undefined))
        await result.current.triggerDownload()

        expect(useDashboardDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 0,
                children: [],
            }),
        )
    })

    it('should log Segment event', async () => {
        const { result } = renderHook(() =>
            useDownloadDashboardData(exampleDashboard),
        )
        await result.current.triggerDownload()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
    })
})
