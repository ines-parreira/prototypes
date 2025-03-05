import React from 'react'

import {
    QueryClientProvider,
    UseMutateFunction,
    UseMutationResult,
} from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import {
    AnalyticsCustomReport,
    AnalyticsCustomReportType,
    CreateAnalyticsCustomReportBody,
    getGetAnalyticsCustomReportQueryOptions,
    getListAnalyticsCustomReportsQueryOptions,
    HttpResponse,
    UpdateAnalyticsCustomReportBody,
    useCreateAnalyticsCustomReport,
    useDeleteAnalyticsCustomReport,
    useListAnalyticsCustomReports,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/api-queries'

import {
    CUSTOM_REPORT_DELETED_ERROR_MESSAGE,
    CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE,
    CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE,
    CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE,
    SUCCESSFULLY_CREATED,
    useCustomReportActions,
} from 'hooks/reporting/custom-reports/useCustomReportActions'
import { CustomReportChildType } from 'models/stat/types'
import { MAX_DASHBOARDS_ALLOWED } from 'pages/stats/custom-reports/constants'
import * as constants from 'pages/stats/custom-reports/constants'
import { CustomReportSchema } from 'pages/stats/custom-reports/types'
import { getErrorMessage } from 'pages/stats/custom-reports/utils'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

const queryClient = mockQueryClient()

const useCreateAnalyticsCustomReportMock = assumeMock(
    useCreateAnalyticsCustomReport,
)
const useDeleteAnalyticsCustomReportMock = assumeMock(
    useDeleteAnalyticsCustomReport,
)
const useListAnalyticsCustomReportsMock = assumeMock(
    useListAnalyticsCustomReports,
)
const useUpdateAnalyticsCustomReportMock = assumeMock(
    useUpdateAnalyticsCustomReport,
)
jest.mock('@gorgias/api-queries')
const getListAnalyticsCustomReportsQueryOptionsMock = assumeMock(
    getListAnalyticsCustomReportsQueryOptions,
)
const getGetAnalyticsCustomReportQueryOptionsMock = assumeMock(
    getGetAnalyticsCustomReportQueryOptions,
)

const mockedDispatch = jest.fn()
const onCloseMock = jest.fn()

jest.mock('@gorgias/api-queries')
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

const invalidationKeys = ['someKey', 'otherKey']
const createInvalidateKey = ['dashboard_key']

const customReport: AnalyticsCustomReport = {
    id: 1,
    name: 'Test Report',
    emoji: '🐱',
    type: 'CUSTOM' as AnalyticsCustomReportType,
    analytics_filter_id: null,
    account_id: 1,
    created_by: 1,
    updated_by: 1,
    created_datetime: '2023-01-01T00:00:00Z',
    updated_datetime: '2023-01-01T00:00:00Z',
    deleted_datetime: null,
    children: [],
}

const duplicateHandlerData = {
    name: customReport.name,
    type: customReport.type,
    emoji: customReport.emoji,
    children: customReport.children,
    analytics_filter_id: customReport.analytics_filter_id,
} as CreateAnalyticsCustomReportBody

const onSuccessMock = jest.fn()

const deleteHandlerData = {
    id: customReport.id,
    name: customReport.name,
    onSuccess: onSuccessMock,
}

const createMutateMock = jest.fn() as jest.MockedFunction<
    UseMutateFunction<
        HttpResponse<AnalyticsCustomReport>,
        unknown,
        { data: CreateAnalyticsCustomReportBody }
    >
>
const deleteMutateMock = jest.fn() as jest.MockedFunction<
    UseMutateFunction<HttpResponse<void>, unknown, { id: number }>
>
const updateMutationMock = jest.fn() as jest.MockedFunction<
    UseMutateFunction<
        HttpResponse<AnalyticsCustomReport>,
        unknown,
        { id: number; data: CreateAnalyticsCustomReportBody }
    >
>

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

describe('useCustomReportActions', () => {
    beforeEach(() => {
        useCreateAnalyticsCustomReportMock.mockReturnValue({
            ...baseMutationResult,
            mutate: createMutateMock,
        } as UseMutationResult<
            HttpResponse<AnalyticsCustomReport>,
            unknown,
            { data: CreateAnalyticsCustomReportBody }
        >)

        useDeleteAnalyticsCustomReportMock.mockReturnValue({
            ...baseMutationResult,
            mutate: deleteMutateMock,
        } as UseMutationResult<HttpResponse<void>, unknown, { id: number }>)

        useListAnalyticsCustomReportsMock.mockReturnValue({
            queryKey: invalidationKeys,
        } as any)

        useUpdateAnalyticsCustomReportMock.mockReturnValue({
            ...baseMutationResult,
            mutate: updateMutationMock,
        } as any)

        getListAnalyticsCustomReportsQueryOptionsMock.mockReturnValue({
            queryKey: createInvalidateKey,
        })

        getGetAnalyticsCustomReportQueryOptionsMock.mockImplementation(
            (id: number) => ({ queryKey: ['customReports', id] }),
        )
    })

    const invalidateQueriesMock = jest.spyOn(queryClient, 'invalidateQueries')

    describe('duplicateReportHandler', () => {
        it('should duplicate report and show success notification', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.duplicateReportHandler(duplicateHandlerData)

            const [mutateArg, mutateOptions] = createMutateMock.mock
                .calls[0] as [
                { data: CreateAnalyticsCustomReportBody },
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
                }),
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
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.duplicateReportHandler(duplicateHandlerData)

            const [, mutateOptions] = createMutateMock.mock.calls[0] as [
                unknown,
                { onError?: () => void },
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
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.deleteReportHandler(deleteHandlerData)

            const [mutateArg, mutateOptions] = deleteMutateMock.mock
                .calls[0] as [
                { id: number },
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
                }),
            )

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess()
            }

            expect(onSuccessMock).toHaveBeenCalled()

            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey: invalidationKeys,
            })

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `${customReport.name} ${CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE}`,
            })
        })

        it('should show error notification when deletion fails', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.deleteReportHandler({
                ...deleteHandlerData,
                onSuccess: undefined,
            })

            const [, mutateOptions] = deleteMutateMock.mock.calls[0] as [
                unknown,
                { onError?: () => void },
            ]
            if (mutateOptions.onError) {
                mutateOptions.onError()
            }

            expect(onSuccessMock).not.toHaveBeenCalled()

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: `${customReport.name} ${CUSTOM_REPORT_DELETED_ERROR_MESSAGE}`,
            })
        })
    })

    describe('updateDashboardHandler', () => {
        const updateHandlerData = {
            chartIds: ['456'],
            onClose: onCloseMock,
            dashboard: {
                id: 1,
                name: 'Test Report',
                analytics_filter_id: null,
                children: [
                    {
                        config_id: '',
                        type: CustomReportChildType.Chart,
                    },
                ],
                emoji: '',
            } as CustomReportSchema,
        }

        const expectPayload = {
            data: {
                analytics_filter_id: null,
                children: [
                    {
                        children: [
                            {
                                config_id: '456',
                                metadata: {},
                                type: 'chart',
                            },
                        ],
                        metadata: {},
                        type: 'row',
                    },
                ],
                emoji: '',
                name: 'Test Report',
                type: 'custom',
            },
        }

        it('should call updateDashboard mutation', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.updateDashboardHandler(updateHandlerData)

            const [mutateArg, mutateOptions] = updateMutationMock.mock
                .calls[0] as [
                { id: number; data: UpdateAnalyticsCustomReportBody },
                {
                    onSuccess?: (data: any) => void
                    onError?: () => void
                },
            ]

            expect(mutateArg).toEqual({
                id: customReport.id,
                data: expectPayload.data,
            })

            expect(mutateOptions).toEqual(
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                }),
            )

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess({
                    data: { id: customReport.id, ...expectPayload.data },
                })
            }

            expect(invalidateQueriesMock).toHaveBeenCalledWith(
                getGetAnalyticsCustomReportQueryOptionsMock(customReport.id)
                    .queryKey,
            )

            expect(invalidateQueriesMock).toHaveBeenCalledWith(invalidationKeys)

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `Successfully saved 1 chart to ${customReport.name}`,
            })
        })

        it('should show a different message when saving multiple charts', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.updateDashboardHandler({
                ...updateHandlerData,
                chartIds: ['1', '2'],
            })

            const [, mutateOptions] = updateMutationMock.mock.calls[0] as [
                { id: number; data: UpdateAnalyticsCustomReportBody },
                {
                    onSuccess?: (data: any) => void
                    onError?: () => void
                },
            ]

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess({ data: { id: customReport.id } })
            }

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `Successfully saved 2 charts to ${customReport.name}`,
            })
        })

        it('should show error notification when saving fails', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.updateDashboardHandler(updateHandlerData)

            const [, mutateOptions] = updateMutationMock.mock.calls[0] as [
                { id: number; data: CreateAnalyticsCustomReportBody },
                {
                    onSuccess?: () => void
                    onError?: () => void
                },
            ]
            if (mutateOptions.onError) {
                mutateOptions.onError()
            }

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Oops! Something went wrong.',
            })
        })
    })

    describe('addChartToDashboardHandler', () => {
        const firstChartId = '456'
        const secondChartId = '789'
        const updateHandlerData = {
            chartId: firstChartId,
            onSuccess: onCloseMock,
            dashboard: {
                id: 1,
                name: 'Test Report',
                analytics_filter_id: null,
                children: [
                    {
                        config_id: secondChartId,
                        type: CustomReportChildType.Chart,
                    },
                ],
                emoji: '',
            } as CustomReportSchema,
        }

        const expectedPayload = {
            data: {
                analytics_filter_id:
                    updateHandlerData.dashboard.analytics_filter_id,
                children: [
                    {
                        children: [
                            {
                                config_id: firstChartId,
                                metadata: {},
                                type: CustomReportChildType.Chart,
                            },
                            {
                                config_id: secondChartId,
                                metadata: {},
                                type: CustomReportChildType.Chart,
                            },
                        ],
                        metadata: {},
                        type: CustomReportChildType.Row,
                    },
                ],
                emoji: updateHandlerData.dashboard.emoji,
                name: updateHandlerData.dashboard.name,
                type: 'custom',
            },
        }

        it('should call updateDashboard mutation', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.addChartToDashboardHandler(updateHandlerData)

            const [mutateArg, mutateOptions] = updateMutationMock.mock
                .calls[0] as [
                { id: number; data: CreateAnalyticsCustomReportBody },
                {
                    onSuccess?: (data: any) => void
                    onError?: () => void
                },
            ]

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess({ data: expectedPayload })
            }

            expect(mutateArg).toEqual({
                id: customReport.id,
                data: expectedPayload.data,
            })
        })
    })

    describe('removeChartFromDashboardHandler', () => {
        const firstChartId = '456'
        const dashboard: CustomReportSchema = {
            id: 1,
            name: 'Test Report',
            emoji: '📊',
            children: [
                {
                    config_id: firstChartId,
                    type: CustomReportChildType.Chart,
                },
                {
                    config_id: '678',
                    type: CustomReportChildType.Chart,
                },
            ],
            analytics_filter_id: 123,
        }
        const data = {
            chartId: firstChartId,
            dashboard,
        }

        const expectedPayload = {
            analytics_filter_id: dashboard.analytics_filter_id,
            children: [
                {
                    children: [
                        {
                            config_id: '678',
                            metadata: {},
                            type: CustomReportChildType.Chart,
                        },
                    ],
                    metadata: {},
                    type: CustomReportChildType.Row,
                },
            ],
            emoji: dashboard.emoji,
            name: dashboard.name,
            type: 'custom',
        }

        it('should remove chart from dashboard', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.removeChartFromDashboardHandler(data)

            const [mutateArg, mutateOptions] = updateMutationMock.mock
                .calls[0] as [
                { id: number; data: CreateAnalyticsCustomReportBody },
                {
                    onSuccess?: (data: any) => void
                    onError?: () => void
                },
            ]

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess({
                    data: { ...expectedPayload, id: customReport.id },
                })
            }

            expect(mutateArg).toEqual({
                id: customReport.id,
                data: expectedPayload,
            })

            expect(invalidateQueriesMock).toHaveBeenCalledWith(
                getGetAnalyticsCustomReportQueryOptionsMock(customReport.id)
                    .queryKey,
            )

            expect(invalidateQueriesMock).toHaveBeenCalledWith(invalidationKeys)

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Successfully removed chart from Test Report',
            })
        })
    })

    describe('getDashboardsHandler', () => {
        it('should return dashboards', () => {
            useListAnalyticsCustomReportsMock.mockReturnValue({
                queryKey: invalidationKeys,
                data: {
                    data: {
                        data: [
                            {
                                id: 1,
                                name: 'B-Test Report',
                                analytics_filter_id: undefined,
                                children: [
                                    {
                                        config_id: '',
                                        type: CustomReportChildType.Chart,
                                    },
                                ],
                                emoji: '',
                            },
                            {
                                id: 2,
                                name: 'A-Test Report',
                                analytics_filter_id: undefined,
                                children: [
                                    {
                                        config_id: '',
                                        type: CustomReportChildType.Chart,
                                    },
                                ],
                                emoji: '',
                            },
                            undefined,
                            null,
                        ],
                    },
                },
            } as any)

            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            const dashboards = result.current.getDashboardsHandler()

            expect(dashboards).toEqual([
                {
                    analytics_filter_id: undefined,
                    children: [
                        {
                            config_id: '',
                            type: 'chart',
                        },
                    ],
                    emoji: '',
                    id: 2,
                    name: 'A-Test Report',
                },
                {
                    analytics_filter_id: undefined,
                    children: [
                        {
                            config_id: '',
                            type: 'chart',
                        },
                    ],
                    emoji: '',
                    id: 1,
                    name: 'B-Test Report',
                },
            ])
        })
    })

    describe('createDashboardHandler', () => {
        const onSuccessMock = jest.fn()
        const chartId = OverviewChart.MedianResolutionTimeTrendCard
        const dashboard = {
            id: 1,
            name: 'Test Report 2',
            analytics_filter_id: null,
            children: [],
            emoji: '',
        }
        const createHandlerData = {
            dashboard: dashboard as CustomReportSchema,
            chartIds: [chartId],
            onSuccess: onSuccessMock,
        }

        it('should call createDashboard action with correct params', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.createDashboardHandler(createHandlerData)

            const [mutateArg, mutateOptions] = createMutateMock.mock
                .calls[0] as [
                { data: CreateAnalyticsCustomReportBody },
                {
                    onSuccess: (data: any) => void
                    onError: () => void
                },
            ]

            expect(mutateArg).toEqual({
                data: {
                    analytics_filter_id: null,
                    children: [
                        {
                            children: [
                                {
                                    config_id: chartId,
                                    metadata: {},
                                    type: CustomReportChildType.Chart,
                                },
                            ],
                            metadata: {},
                            type: CustomReportChildType.Row,
                        },
                    ],
                    emoji: '',
                    name: dashboard.name,
                    type: 'custom',
                },
            })

            expect(mutateOptions).toEqual(
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                }),
            )

            if (mutateOptions.onSuccess) {
                mutateOptions.onSuccess({ id: 'new_id' })
            }

            expect(invalidateQueriesMock).toHaveBeenCalledWith(
                createInvalidateKey,
            )

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: `${dashboard.name} ${SUCCESSFULLY_CREATED}`,
            })

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should not call the mutation if dashboards limit is reached', () => {
            const createHandlerDataWithoutChartIds = {
                dashboard: dashboard as CustomReportSchema,
                onSuccess: onSuccessMock,
            }

            useListAnalyticsCustomReportsMock.mockReturnValue({
                queryKey: invalidationKeys,
                data: {
                    data: {
                        data: Array(MAX_DASHBOARDS_ALLOWED + 1).fill({
                            id: 1,
                            name: 'B-Test Report',
                            analytics_filter_id: undefined,
                            children: [
                                {
                                    config_id: '',
                                    type: CustomReportChildType.Chart,
                                },
                            ],
                            emoji: '',
                        }),
                    },
                },
            } as any)

            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.createDashboardHandler(
                createHandlerDataWithoutChartIds,
            )

            const mutateOptions = createMutateMock.mock.calls[0] as [
                { data: CreateAnalyticsCustomReportBody },
                {
                    onSuccess: (data: any) => void
                    onError: () => void
                },
            ]

            expect(mutateOptions).toEqual(undefined)

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: constants.LIMIT_REACHED_MESSAGE,
            })
        })

        it('should show error notification when duplication fails', () => {
            const { result } = renderHook(() => useCustomReportActions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            result.current.createDashboardHandler(createHandlerData)

            const [, mutateOptions] = createMutateMock.mock.calls[0] as [
                unknown,
                { onError?: () => void },
            ]

            if (mutateOptions.onError) {
                mutateOptions.onError()
            }

            expect(notify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: getErrorMessage(''),
            })
        })
    })
})
