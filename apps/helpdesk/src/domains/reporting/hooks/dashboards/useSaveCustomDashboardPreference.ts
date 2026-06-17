import { useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useUpdateAnalyticsCustomReport,
} from '@gorgias/helpdesk-queries'

import { Duration } from '@gorgias/toolkit'
import { useDebouncedCallback } from '@gorgias/toolkit-react'
import { useDashboardChartContext } from 'domains/reporting/pages/dashboards/DashboardChartContext'
import type {
    ChartPreferences,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    createDashboardPayload,
    getErrorMessage,
    updateChartPreferencesInDashboard,
} from 'domains/reporting/pages/dashboards/utils'

type Params = {
    dashboard: DashboardSchema | undefined
    configId: string
}

export function useSaveCustomDashboardPreference({
    dashboard: dashboardProp,
    configId: configIdProp,
}: Params) {
    const ctx = useDashboardChartContext()
    const dashboard = ctx?.dashboard ?? dashboardProp
    const configId = ctx?.schema?.config_id ?? configIdProp

    const queryClient = useQueryClient()
    const { mutate } = useUpdateAnalyticsCustomReport({
        mutation: { retry: false },
    })

    const dashboardRef = useRef(dashboard)
    dashboardRef.current = dashboard
    const configIdRef = useRef(configId)
    configIdRef.current = configId

    const savePreferences = useDebouncedCallback(
        (preferences: ChartPreferences) => {
            const currentDashboard = dashboardRef.current
            const currentConfigId = configIdRef.current
            if (!currentDashboard || !currentConfigId) return

            const updated = updateChartPreferencesInDashboard(
                currentDashboard,
                currentConfigId,
                preferences,
            )
            mutate(
                {
                    id: currentDashboard.id,
                    data: createDashboardPayload(updated),
                },
                {
                    onSuccess(data) {
                        void queryClient.invalidateQueries(
                            queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                                data.data.id,
                            ),
                        )
                        void queryClient.invalidateQueries(
                            queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                        )
                    },
                    onError: (error) => toast.error(getErrorMessage(error)),
                },
            )
        },
        Duration.millis(300),
    )

    return { savePreferences }
}
