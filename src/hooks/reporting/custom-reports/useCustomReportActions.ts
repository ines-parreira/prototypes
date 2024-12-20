import {
    CreateAnalyticsCustomReportBody,
    useCreateAnalyticsCustomReport,
    useDeleteAnalyticsCustomReport,
    useListAnalyticsCustomReports,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE = 'successfully duplicated'
export const CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE = 'could not be duplicated'
export const CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE = 'successfully deleted'
export const CUSTOM_REPORT_DELETED_ERROR_MESSAGE = 'could not be deleted'

const handleMutationSuccess = (
    dispatch: ReturnType<typeof useAppDispatch>,
    reportName: string,
    successMessage: string
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: `${reportName} ${successMessage}`,
        })
    )
}

const handleMutationError = (
    dispatch: ReturnType<typeof useAppDispatch>,
    reportName: string,
    errorMessage: string
) => {
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: `${reportName} ${errorMessage}`,
        })
    )
}

export const useCustomReportActions = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const createMutation = useCreateAnalyticsCustomReport()
    const deleteMutation = useDeleteAnalyticsCustomReport()
    const listReportsQueryKey = useListAnalyticsCustomReports().queryKey

    const duplicateReportHandler = useCallback(
        (data: CreateAnalyticsCustomReportBody) => {
            createMutation.mutate(
                {
                    data,
                },
                {
                    onSuccess: () => {
                        handleMutationSuccess(
                            dispatch,
                            data.name,
                            CUSTOM_REPORT_DUPLICATE_SUCCESS_MESSAGE
                        )
                        void queryClient.invalidateQueries({
                            queryKey: listReportsQueryKey,
                        })
                    },
                    onError: () =>
                        handleMutationError(
                            dispatch,
                            data.name,
                            CUSTOM_REPORT_DUPLICATE_ERROR_MESSAGE
                        ),
                }
            )
        },
        [createMutation, dispatch, listReportsQueryKey, queryClient]
    )

    const deleteReportHandler = useCallback(
        (data: {id: number; name: string}) => {
            deleteMutation.mutate(
                {
                    id: data.id,
                },
                {
                    onSuccess: () => {
                        handleMutationSuccess(
                            dispatch,
                            data.name,
                            CUSTOM_REPORT_DELETED_SUCCESS_MESSAGE
                        )

                        void queryClient.invalidateQueries({
                            queryKey: listReportsQueryKey,
                        })
                    },
                    onError: () =>
                        handleMutationError(
                            dispatch,
                            data.name,
                            CUSTOM_REPORT_DELETED_ERROR_MESSAGE
                        ),
                }
            )
        },
        [deleteMutation, dispatch, listReportsQueryKey, queryClient]
    )

    return {
        duplicateReportHandler,
        deleteReportHandler,
    }
}
