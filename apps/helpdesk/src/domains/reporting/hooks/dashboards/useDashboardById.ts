import { useGetAnalyticsCustomReport } from '@gorgias/helpdesk-queries'

import { dashboardFromApi } from 'domains/reporting/pages/dashboards/utils'

export const useDashboardById = (dashboardId: number) => {
    return useGetAnalyticsCustomReport(dashboardId, {
        query: {
            select(response) {
                return dashboardFromApi(response.data)
            },
        },
    })
}
