import {
    useCreateAnalyticsCustomReport,
    useDeleteAnalyticsCustomReport,
    AnalyticsCustomReport,
    AnalyticsCustomReportType,
    HttpResponse,
    CreateAnalyticsCustomReportBody,
    useListAnalyticsCustomReports,
} from '@gorgias/api-queries'
import {
    QueryClientProvider,
    UseMutationResult,
    UseMutateFunction,
} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {
    useCustomReportActions,
    CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE,
    CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE,
    CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE,
    CUSTOM_REPORT_DELETED_ERROR_MESSAGE,
} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

const queryClient = mockQueryClient()

jest.mock('@gorgias/api-queries')
const useCreateAnalyticsCustomReportMock = assumeMock(
    useCreateAnalyticsCustomReport
)
const useDeleteAnalyticsCustomReportMock = assumeMock(
    useDeleteAnalyticsCustomReport
)

const useListAnalyticsCustomReportsMock = assumeMock(
    useListAnalyticsCustomReports
)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useCustomReportActions', () => {
    const invalidationKeys = ['someKey', 'otherKey']
    const customReport: AnalyticsCustomReport = {
        id: 1,
        name: 'Test Report',
        type: 'CUSTOM' as AnalyticsCustomReportType,
        analytics_filter_id: 123,
        account_id: 1,
        created_by: 1,
        updated_by: 1,
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-01T00:00:00Z',
        children: [],
    }

    const duplicateHandlerData = {
        name: customReport.name,
        type: customReport.type,
        emoji: customReport.emoji,
        children: customReport.children,
        analytics_filter_id: customReport.analytics_filter_id,
    }

    const deleteHandlerData = {
        id: customReport.id,
        name: customReport.name,
    }

    const createMutateMock = jest.fn() as jest.MockedFunction<
        UseMutateFunction<
            HttpResponse<AnalyticsCustomReport>,
            unknown,
            {data: CreateAnalyticsCustomReportBody},
            unknown
        >
    >
    const deleteMutateMock = jest.fn() as jest.MockedFunction<
        UseMutateFunction<HttpResponse<void>, unknown, {id: number}, unknown>
    >

    beforeEach(() => {
        const baseMutationResult = {
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
            status: 'idle',
            reset: jest.fn(),
            context: undefined,
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            mutateAsync: jest.fn(),
            isPaused: false,
            variables: undefined,
        }

        useCreateAnalyticsCustomReportMock.mockReturnValue({
            ...baseMutationResult,
            mutate: createMutateMock,
        } as UseMutationResult<
            HttpResponse<AnalyticsCustomReport>,
            unknown,
            {data: CreateAnalyticsCustomReportBody},
            unknown
        >)

        useDeleteAnalyticsCustomReportMock.mockReturnValue({
            ...baseMutationResult,
            mutate: deleteMutateMock,
        } as UseMutationResult<
            HttpResponse<void>,
            unknown,
            {id: number},
            unknown
        >)

        useListAnalyticsCustomReportsMock.mockReturnValue({
            queryKey: invalidationKeys,
        } as any)
    })

    describe('duplicateReportHandler', () => {
        it('should duplicate report and show success notification', () => {
            const invalidateQueriesMock = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )

            const {result} = renderHook(() => useCustomReportActions(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.duplicateReportHandler(duplicateHandlerData)

            const [mutateArg, mutateOptions] = createMutateMock.mock
                .calls[0] as [
                {data: CreateAnalyticsCustomReportBody},
                {
                    onSuccess?: () => void
                    onError?: () => void
                },
            ]

            expect(mutateArg).toEqual({
                data: {
                    name: `${customReport.name}`,
                    type: customReport.type,
                    analytics_filter_id: customReport.analytics_filter_id,
                    children: customReport.children,
                    emoji: customReport.emoji,
                },
            })
            expect(mutateOptions).toEqual(
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                })
            )

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess()
            }

            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey: invalidationKeys,
            })

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `${customReport.name} ${CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE}`,
            })
        })

        it('should show error notification when duplication fails', () => {
            const {result} = renderHook(() => useCustomReportActions(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.duplicateReportHandler(duplicateHandlerData)

            const [, mutateOptions] = createMutateMock.mock.calls[0] as [
                unknown,
                {onError?: () => void},
            ]
            if (mutateOptions.onError) {
                mutateOptions.onError()
            }

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: `${customReport.name} ${CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE}`,
            })
        })
    })

    describe('deleteReportHandler', () => {
        it('should delete report and show success notification', () => {
            const invalidateQueriesMock = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )

            const {result} = renderHook(() => useCustomReportActions(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.deleteReportHandler(deleteHandlerData)

            const [mutateArg, mutateOptions] = deleteMutateMock.mock
                .calls[0] as [
                {id: number},
                {
                    onSuccess?: () => void
                    onError?: () => void
                },
            ]

            expect(mutateArg).toEqual({
                id: customReport.id,
            })
            expect(mutateOptions).toEqual(
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                })
            )

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess()
            }

            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey: invalidationKeys,
            })

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `${customReport.name} ${CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE}`,
            })
        })

        it('should show error notification when deletion fails', () => {
            const {result} = renderHook(() => useCustomReportActions(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.deleteReportHandler(deleteHandlerData)

            const [, mutateOptions] = deleteMutateMock.mock.calls[0] as [
                unknown,
                {onError?: () => void},
            ]
            if (mutateOptions.onError) {
                mutateOptions.onError()
            }

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: `${customReport.name} ${CUSTOM_REPORT_DELETED_ERROR_MESSAGE}`,
            })
        })
    })
})
