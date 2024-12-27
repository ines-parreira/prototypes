import {QueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'

import {
    CustomReportChartSchema,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSectionSchema,
} from 'models/stat/types'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {getMutationConfig} from 'pages/stats/custom-reports/useUpdateCustomReport'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

jest.mock('state/notifications/actions')
jest.mock('@gorgias/api-queries')

const onClose = jest.fn()
const dispatch = jest.fn()

const section: CustomReportSectionSchema = {
    children: [],
    type: CustomReportChildType.Section,
}
const chart: CustomReportChartSchema = {
    type: CustomReportChildType.Chart,
    config_id: OverviewMetric.TicketsCreated,
}

const row: CustomReportRowSchema = {
    type: CustomReportChildType.Row,
    children: [chart],
}
const customReport: CustomReportSchema = {
    id: 2,
    analytics_filter_id: 1,
    name: 'some report',
    emoji: null,
    children: [row, section],
}

describe('getMutationConfig', () => {
    it('should invalidate the custom reports query cache on success', () => {
        const mockQueryClient = {
            invalidateQueries: jest.fn(),
        } as unknown as QueryClient

        const {mutation} = getMutationConfig({
            savedChartsLength: 1,
            reportName: customReport.name,
            queryClient: mockQueryClient,
            dispatch,
            onClose,
        })

        mutation.onSuccess()

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['analyticsCustomReports', 'getAnalyticsCustomReport'],
        })
        expect(onClose).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: `Successfully saved 1 chart to ${customReport.name}`,
        })
    })

    it('should change the notification message for more than one selected chart', () => {
        const mockQueryClient = {
            invalidateQueries: jest.fn(),
        } as unknown as QueryClient

        const {mutation} = getMutationConfig({
            savedChartsLength: 2,
            reportName: customReport.name,
            queryClient: mockQueryClient,
            dispatch,
            onClose,
        })

        mutation.onSuccess()

        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: `Successfully saved 2 charts to ${customReport.name}`,
        })
    })

    it('should show a notification on error', () => {
        const mockQueryClient = {
            invalidateQueries: jest.fn(),
        } as unknown as QueryClient

        const {mutation} = getMutationConfig({
            savedChartsLength: 1,
            reportName: customReport.name,
            queryClient: mockQueryClient,
            dispatch,
            onClose,
        })

        const error = {
            response: {data: {error: {msg: 'Error Message'}}},
        } as AxiosError<{error: {msg: string}}>

        mutation.onError(error)

        expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message: error?.response?.data?.error?.msg,
        })
    })
})
