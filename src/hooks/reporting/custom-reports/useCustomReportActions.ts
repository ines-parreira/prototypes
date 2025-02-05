import {
    AnalyticsCustomReport,
    CreateAnalyticsCustomReportBody,
    getListAnalyticsCustomReportsQueryOptions,
    useCreateAnalyticsCustomReport,
    useDeleteAnalyticsCustomReport,
    useListAnalyticsCustomReports,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import _sortBy from 'lodash/sortBy'
import {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'pages/stats/custom-reports/constants'
import {
    CustomReportSchema,
    DashboardInput,
} from 'pages/stats/custom-reports/types'
import {
    customReportFromApi,
    getChildrenIds,
    getGroupChartsIntoRows,
    createDashboardPayload,
    getErrorMessage,
} from 'pages/stats/custom-reports/utils'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE = 'successfully duplicated'
export const CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE = 'could not be duplicated'
export const CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE = 'successfully deleted'
export const CUSTOM_REPORT_DELETED_ERROR_MESSAGE = 'could not be deleted'
export const CUSTOM_REPORT_EDITED_ERROR_MESSAGE = 'could not be modified'
export const SUCCESSFULLY_CREATED = 'Successfully created'

const handleMutationSuccess = (
    dispatch: ReturnType<typeof useAppDispatch>,
    successMessage: string
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: successMessage,
        })
    )
}

const handleMutationError = (
    dispatch: ReturnType<typeof useAppDispatch>,
    errorMessage: string
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: errorMessage,
        })
    )
}

export const CUSTOM_REPORTS_QUERY_KEY = [
    'analyticsCustomReports',
    'getAnalyticsCustomReport',
]

export const useCustomReportActions = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const createMutation = useCreateAnalyticsCustomReport()
    const deleteMutation = useDeleteAnalyticsCustomReport()
    const updateMutation = useUpdateAnalyticsCustomReport()
    const listDashboardsQuery = useListAnalyticsCustomReports()
    const listReportsQueryKey = listDashboardsQuery.queryKey

    const createDashboardHandler = useCallback(
        ({
            dashboard,
            chartIds,
            onSuccess,
        }: {
            dashboard: DashboardInput
            chartIds?: string[]
            onSuccess?: (data: AnalyticsCustomReport) => void
        }) => {
            const apiDashboards = listDashboardsQuery.data?.data?.data || []

            if (apiDashboards.length >= MAX_DASHBOARDS_ALLOWED) {
                return handleMutationError(dispatch, LIMIT_REACHED_MESSAGE)
            }

            const children = chartIds
                ? getGroupChartsIntoRows(chartIds)
                : dashboard?.children

            const apiDashboard = createDashboardPayload({
                ...dashboard,
                children,
            })

            return createMutation.mutate(
                {
                    data: apiDashboard,
                },
                {
                    onSuccess: ({data}: {data: AnalyticsCustomReport}) => {
                        const {queryKey: customReportsQueryKey} =
                            getListAnalyticsCustomReportsQueryOptions()

                        void queryClient.invalidateQueries(
                            customReportsQueryKey
                        )

                        handleMutationSuccess(
                            dispatch,
                            `${dashboard.name} ${SUCCESSFULLY_CREATED}`
                        )

                        onSuccess && onSuccess(data)
                    },
                    onError: (error) =>
                        handleMutationError(dispatch, getErrorMessage(error)),
                }
            )
        },
        [
            createMutation,
            dispatch,
            listDashboardsQuery.data?.data?.data,
            queryClient,
        ]
    )

    const duplicateReportHandler = useCallback(
        (data: CreateAnalyticsCustomReportBody) => {
            return createMutation.mutate(
                {
                    data,
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            queryKey: listReportsQueryKey,
                        })

                        handleMutationSuccess(
                            dispatch,
                            `${data.name} ${CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE}`
                        )
                    },
                    onError: () =>
                        handleMutationError(
                            dispatch,
                            `${data.name} ${CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE}`
                        ),
                }
            )
        },
        [createMutation, dispatch, listReportsQueryKey, queryClient]
    )

    const deleteReportHandler = useCallback(
        ({
            name,
            id,
            onSuccess,
        }: {
            id: number
            name: string
            onSuccess?: () => void
        }) => {
            deleteMutation.mutate(
                {
                    id,
                },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            queryKey: listReportsQueryKey,
                        })

                        handleMutationSuccess(
                            dispatch,
                            `${name} ${CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE}`
                        )

                        if (onSuccess) {
                            onSuccess()
                        }
                    },
                    onError: () =>
                        handleMutationError(
                            dispatch,
                            `${name} ${CUSTOM_REPORT_DELETED_ERROR_MESSAGE}`
                        ),
                }
            )
        },
        [deleteMutation, dispatch, listReportsQueryKey, queryClient]
    )

    const updateDashboardHandler = useCallback(
        ({
            dashboard,
            chartIds,
            onSuccess,
            successMessage,
        }: {
            dashboard: CustomReportSchema | undefined
            chartIds?: string[]
            onSuccess?: () => void
            successMessage?: string
        }) => {
            if (dashboard) {
                const children = getGroupChartsIntoRows(
                    chartIds || getChildrenIds(dashboard.children)
                )

                const apiDashboard = createDashboardPayload({
                    ...dashboard,
                    children,
                })

                updateMutation.mutate(
                    {
                        id: dashboard.id,
                        data: apiDashboard,
                    },
                    {
                        onSuccess: () => {
                            void queryClient.invalidateQueries({
                                queryKey: CUSTOM_REPORTS_QUERY_KEY,
                            })

                            void queryClient.invalidateQueries({
                                queryKey: listReportsQueryKey,
                            })

                            handleMutationSuccess(
                                dispatch,
                                successMessage ||
                                    `Successfully added ${chartIds?.length} ${chartIds?.length === 1 ? 'chart' : 'charts'} to ${dashboard.name}`
                            )

                            if (onSuccess) {
                                onSuccess()
                            }
                        },
                        onError: () =>
                            handleMutationError(
                                dispatch,
                                `${dashboard.name} ${CUSTOM_REPORT_EDITED_ERROR_MESSAGE}`
                            ),
                    }
                )
            }
        },

        [updateMutation, dispatch, listReportsQueryKey, queryClient]
    )

    const addChartToDashboardHandler = useCallback(
        ({
            dashboard,
            chartId,
            onSuccess,
        }: {
            dashboard: CustomReportSchema
            chartId: string
            onSuccess: () => void
        }) => {
            const childrenIds = getChildrenIds(dashboard?.children)

            updateDashboardHandler({
                dashboard,
                chartIds: [...childrenIds, chartId],
                onSuccess,
                successMessage: `Successfully added chart to ${dashboard.name}`,
            })
        },
        [updateDashboardHandler]
    )

    const getDashboardsHandler = useCallback((): CustomReportSchema[] => {
        const apiDashboards = listDashboardsQuery.data?.data?.data || []

        const dashboards = apiDashboards.reduce((acc, dashboard) => {
            const customReport = customReportFromApi(dashboard)
            if (customReport) {
                acc.push(customReport)
            }
            return acc
        }, [] as CustomReportSchema[])

        return _sortBy(dashboards, (dashboard) => dashboard.name.toLowerCase())
    }, [listDashboardsQuery])

    const removeChartFromDashboardHandler = useCallback(
        ({
            dashboard,
            chartId,
        }: {
            dashboard: CustomReportSchema
            chartId: string
        }) => {
            const childrenIds = getChildrenIds(dashboard.children)

            updateDashboardHandler({
                dashboard,
                chartIds: childrenIds.filter((id) => id !== chartId),
                successMessage: `Successfully removed chart from ${dashboard.name}`,
            })
        },
        [updateDashboardHandler]
    )

    return {
        createDashboardHandler,
        duplicateReportHandler,
        deleteReportHandler,
        updateDashboardHandler,
        addChartToDashboardHandler,
        getDashboardsHandler,
        removeChartFromDashboardHandler,
        isCreateMutationLoading: createMutation.isLoading,
        isCreateMutationError: createMutation.isError,
    }
}
