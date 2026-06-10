import { useCallback } from 'react'

import type { ColumnConfig } from '@gorgias/helpdesk-types'

import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'

type Params = {
    customDashboardChartSchema?: DashboardChartSchema
    dashboard?: DashboardSchema
}

export function useCustomDashboardTableColumns({
    customDashboardChartSchema,
    dashboard,
}: Params) {
    const { savePreferences } = useSaveCustomDashboardPreference({
        dashboard,
        configId: customDashboardChartSchema?.config_id ?? '',
    })

    const onSaveColumns = useCallback(
        (columns: ColumnConfig[]) => savePreferences({ columns }),
        [savePreferences],
    )

    return {
        onSaveColumns: dashboard ? onSaveColumns : undefined,
    }
}
