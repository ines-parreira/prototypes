import {
    getGetAnalyticsCustomReportQueryOptions,
    GetAnalyticsCustomReportResult,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {DashboardInput} from 'pages/stats/custom-reports/types'
import {createDashboardPayload} from 'pages/stats/custom-reports/utils'

export const useUpdateDashboardCache = (id: number) => {
    const queryClient = useQueryClient()

    return useCallback(
        (dashboard: DashboardInput) => {
            const {queryKey} = getGetAnalyticsCustomReportQueryOptions(id)

            const fromCache =
                queryClient.getQueryData<GetAnalyticsCustomReportResult>(
                    queryKey
                )

            const data = createDashboardPayload(dashboard)

            if (fromCache) {
                queryClient.setQueryData(queryKey, {
                    ...fromCache,
                    data: {...fromCache.data, ...data},
                })
            } else {
                queryClient.setQueryData(queryKey, {data})
            }
        },
        [queryClient, id]
    )
}
