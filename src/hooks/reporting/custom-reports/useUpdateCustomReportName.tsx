import {
    AnalyticsCustomReport,
    HttpResponse,
    getGetAnalyticsCustomReportQueryOptions,
    getListAnalyticsCustomReportsQueryOptions,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {DashboardInput} from 'pages/stats/custom-reports/types'
import {createDashboardPayload} from 'pages/stats/custom-reports/utils'

export const updateDashboardMutationConfig = (queryClient: QueryClient) => ({
    onSuccess(data: HttpResponse<AnalyticsCustomReport>) {
        const byIdQueryKey = getGetAnalyticsCustomReportQueryOptions(
            data.data.id
        ).queryKey

        const listQueryKey =
            getListAnalyticsCustomReportsQueryOptions().queryKey

        return Promise.all([
            queryClient.invalidateQueries(byIdQueryKey),
            queryClient.invalidateQueries(listQueryKey),
        ])
    },
})

export const useUpdateCustomReportName = (id: number) => {
    const queryClient = useQueryClient()
    const {mutateAsync} = useUpdateAnalyticsCustomReport({
        mutation: updateDashboardMutationConfig(queryClient),
    })

    const updateCustomReport = useCallback(
        (dashboard: DashboardInput) => {
            return mutateAsync({
                id,
                data: createDashboardPayload({dashboard}),
            })
        },
        [mutateAsync, id]
    )

    return {updateCustomReport}
}
