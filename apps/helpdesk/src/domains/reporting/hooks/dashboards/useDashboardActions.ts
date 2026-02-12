import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import _sortBy from 'lodash/sortBy'

import type {
    AnalyticsCustomReport,
    HttpResponse,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useCreateAnalyticsCustomReport,
    useDeleteAnalyticsCustomReport,
    useListAnalyticsCustomReports,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/helpdesk-queries'

import {
    LIMIT_REACHED_MESSAGE,
    MAX_DASHBOARDS_ALLOWED,
} from 'domains/reporting/pages/dashboards/constants'
import type {
    DashboardInput,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    createDashboardPayload,
    dashboardFromApi,
    getChildrenIds,
    getErrorMessage,
    getGroupChartsIntoRows,
} from 'domains/reporting/pages/dashboards/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const DASHBOARD_DELETED_SUCCESS_MESSAGE = 'successfully deleted'
export const DASHBOARD_DELETED_ERROR_MESSAGE = 'could not be deleted'
export const SUCCESSFULLY_CREATED = 'Successfully created'

const handleMutationSuccess = (
    dispatch: ReturnType<typeof useAppDispatch>,
    successMessage: string,
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: successMessage,
        }),
    )
}

const handleMutationError = (
    dispatch: ReturnType<typeof useAppDispatch>,
    errorMessage: string,
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: errorMessage,
        }),
    )
}

export const useDashboardActions = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const createMutation = useCreateAnalyticsCustomReport({
        mutation: {
            retry: false,
        },
    })
    const deleteMutation = useDeleteAnalyticsCustomReport()
    const updateMutation = useUpdateAnalyticsCustomReport({
        mutation: {
            retry: false,
        },
    })
    const listDashboardsQuery = useListAnalyticsCustomReports()

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
                ? getGroupChartsIntoRows(chartIds, dashboard.children)
                : dashboard.children

            const apiDashboard = createDashboardPayload({
                ...dashboard,
                children,
            })

            createMutation.mutate(
                {
                    data: apiDashboard,
                },
                {
                    onSuccess: ({ data }: { data: AnalyticsCustomReport }) => {
                        const queryKey =
                            queryKeys.analyticsCustomReports.listAnalyticsCustomReports()

                        void queryClient.invalidateQueries(queryKey)

                        handleMutationSuccess(
                            dispatch,
                            `${dashboard.name} ${SUCCESSFULLY_CREATED}`,
                        )

                        onSuccess && onSuccess(data)
                    },
                    onError: (error) =>
                        handleMutationError(dispatch, getErrorMessage(error)),
                },
            )
        },
        [
            createMutation,
            dispatch,
            listDashboardsQuery.data?.data?.data,
            queryClient,
        ],
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
                            queryKey:
                                queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                        })

                        handleMutationSuccess(
                            dispatch,
                            `${name} ${DASHBOARD_DELETED_SUCCESS_MESSAGE}`,
                        )

                        if (onSuccess) {
                            onSuccess()
                        }
                    },
                    onError: () =>
                        handleMutationError(
                            dispatch,
                            `${name} ${DASHBOARD_DELETED_ERROR_MESSAGE}`,
                        ),
                },
            )
        },
        [deleteMutation, dispatch, queryClient],
    )

    const updateDashboardHandler = useCallback(
        ({
            dashboard,
            chartIds,
            onSuccess,
            successMessage,
            errorMessage,
        }: {
            dashboard: DashboardSchema
            chartIds?: string[]
            onSuccess?: () => void
            successMessage?: string
            errorMessage?: string
        }) => {
            const children = chartIds
                ? getGroupChartsIntoRows(chartIds, dashboard.children)
                : dashboard.children

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
                    onSuccess(data: HttpResponse<AnalyticsCustomReport>) {
                        handleMutationSuccess(
                            dispatch,
                            successMessage ||
                                `Successfully saved ${chartIds?.length} ${chartIds?.length === 1 ? 'chart' : 'charts'} to ${dashboard.name}`,
                        )

                        queryClient.invalidateQueries(
                            queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                                data.data.id,
                            ),
                        )
                        queryClient.invalidateQueries(
                            queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                        )

                        if (onSuccess) {
                            onSuccess()
                        }
                    },
                    onError: (error) =>
                        handleMutationError(
                            dispatch,
                            errorMessage || getErrorMessage(error),
                        ),
                },
            )
        },

        [updateMutation, dispatch, queryClient],
    )

    const addChartToDashboardHandler = useCallback(
        ({
            dashboard,
            chartId,
            onSuccess,
        }: {
            dashboard: DashboardSchema
            chartId: string
            onSuccess: () => void
        }) => {
            const childrenIds = getChildrenIds(dashboard?.children)

            updateDashboardHandler({
                dashboard,
                chartIds: [chartId, ...childrenIds],
                onSuccess,
                successMessage: `Successfully added chart to ${dashboard.name}`,
            })
        },
        [updateDashboardHandler],
    )

    const getDashboardsHandler = useCallback((): DashboardSchema[] => {
        const apiDashboards = listDashboardsQuery.data?.data?.data || []

        const dashboards = apiDashboards.reduce((acc, dashboard) => {
            const dash = dashboardFromApi(dashboard)
            if (dash) {
                acc.push(dash)
            }
            return acc
        }, [] as DashboardSchema[])

        return _sortBy(dashboards, (dashboard) => dashboard.name.toLowerCase())
    }, [listDashboardsQuery])

    const removeChartFromDashboardHandler = useCallback(
        ({
            dashboard,
            chartId,
        }: {
            dashboard: DashboardSchema
            chartId: string
        }) => {
            const childrenIds = getChildrenIds(dashboard.children)

            updateDashboardHandler({
                dashboard,
                chartIds: childrenIds.filter((id) => id !== chartId),
                successMessage: `Successfully removed chart from ${dashboard.name}`,
            })
        },
        [updateDashboardHandler],
    )

    return {
        createDashboardHandler,
        deleteReportHandler,
        updateDashboardHandler,
        addChartToDashboardHandler,
        getDashboardsHandler,
        removeChartFromDashboardHandler,
        isListing: listDashboardsQuery.isLoading,
        isCreateMutationLoading: createMutation.isLoading,
        isCreateMutationError: createMutation.isError,
        isUpdateMutationLoading: updateMutation.isLoading,
        isUpdateMutationError: updateMutation.isError,
    }
}
