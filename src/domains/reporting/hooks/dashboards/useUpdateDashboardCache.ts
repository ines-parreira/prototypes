import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    GetAnalyticsCustomReportResult,
    queryKeys,
} from '@gorgias/helpdesk-queries'

import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { createDashboardPayload } from 'domains/reporting/pages/dashboards/utils'

export const useUpdateDashboardCache = (id: number) => {
    const queryClient = useQueryClient()

    return useCallback(
        (dashboard: DashboardSchema) => {
            const queryKey =
                queryKeys.analyticsCustomReports.getAnalyticsCustomReport(id)

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
