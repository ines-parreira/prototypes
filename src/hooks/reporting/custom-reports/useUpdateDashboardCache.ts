import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    GetAnalyticsCustomReportResult,
    getGetAnalyticsCustomReportQueryOptions,
} from '@gorgias/api-queries'

import { CustomReportSchema } from 'pages/stats/custom-reports/types'
import { createDashboardPayload } from 'pages/stats/custom-reports/utils'

export const useUpdateDashboardCache = (id: number) => {
    const queryClient = useQueryClient()

    return useCallback(
        (dashboard: CustomReportSchema) => {
            const { queryKey } = getGetAnalyticsCustomReportQueryOptions(id)

            const fromCache =
                queryClient.getQueryData<GetAnalyticsCustomReportResult>(
                    queryKey,
                )

            const data = createDashboardPayload(dashboard)

            if (fromCache) {
                queryClient.setQueryData(queryKey, {
                    ...fromCache,
                    data: { ...fromCache.data, ...data },
                })
            } else {
                queryClient.setQueryData(queryKey, { data })
            }
        },
        [queryClient, id],
    )
}
