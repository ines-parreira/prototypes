import { useCallback } from 'react'

import type { DashboardLayoutConfig } from '../types'
import { useUpdateLayoutSectionForChart } from './useUpdateLayoutSectionForChart'

type Params<TChart extends string> = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig<TChart>
}

export function useSaveTableColumnVisibility<TChart extends string>(
    params: Params<TChart>,
): {
    saveVisibleColumns: (chartId: string, visibleColumns: string[]) => void
} {
    const updateSectionForChart = useUpdateLayoutSectionForChart(params)

    const saveVisibleColumns = useCallback(
        (chartId: string, visibleColumns: string[]) => {
            updateSectionForChart(chartId, (section) => ({
                ...section,
                items: section.items.map((item) =>
                    item.chartId === chartId
                        ? { ...item, visibleColumns }
                        : item,
                ),
            }))
        },
        [updateSectionForChart],
    )

    return { saveVisibleColumns }
}
