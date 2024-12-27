import {useUpdateAnalyticsCustomReport} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {AxiosError} from 'axios'
import {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {getGroupChartsIntoRows} from 'pages/stats/custom-reports/utils'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'

export const getMutationConfig = ({
    savedChartsLength,
    reportName,
    queryClient,
    dispatch,
    onClose,
}: {
    savedChartsLength: number
    reportName?: string
    queryClient: QueryClient
    dispatch: StoreDispatch
    onClose: () => void
}) => ({
    mutation: {
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [
                    'analyticsCustomReports',
                    'getAnalyticsCustomReport',
                ],
            })

            onClose()

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Successfully saved ${savedChartsLength} ${savedChartsLength === 1 ? 'chart' : 'charts'} to ${reportName}`,
                })
            )
        },
        onError: (error: AxiosError<{error: {msg: string}}>) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: error?.response?.data?.error?.msg,
                })
            )
        },
    },
})

type Props = {
    customReport: CustomReportSchema | undefined
    checkedCharts: string[]
    onClose: () => void
}

export const useUpdateCustomReport = ({
    customReport,
    checkedCharts,
    onClose,
}: Props) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const {mutateAsync, isLoading} = useUpdateAnalyticsCustomReport(
        getMutationConfig({
            dispatch,
            queryClient,
            savedChartsLength: checkedCharts.length,
            reportName: customReport?.name,
            onClose,
        })
    )

    const updateCustomReport = useCallback(() => {
        if (customReport) {
            return mutateAsync({
                id: customReport.id,
                data: {
                    name: customReport.name,
                    emoji: customReport.emoji,
                    type: 'custom',
                    // Temporary use of 'as' until a fix is made. related tickets: #3195 & #3196
                    analytics_filter_id:
                        customReport.analytics_filter_id as number,
                    children: getGroupChartsIntoRows(checkedCharts),
                },
            })
        }
    }, [checkedCharts, customReport, mutateAsync])

    return {updateCustomReport, isLoading}
}
