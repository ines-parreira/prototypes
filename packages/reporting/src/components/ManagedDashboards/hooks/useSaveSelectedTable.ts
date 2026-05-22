import { useCallback } from 'react'

import type { DashboardLayoutConfig } from '../types'
import { useUpdateLayoutSectionForChart } from './useUpdateLayoutSectionForChart'

type Params<TChart extends string> = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig<TChart>
}

export function useSaveSelectedTable<TChart extends string>(
    params: Params<TChart>,
): {
    onSelect: (chartId: string) => void
} {
    const updateSectionForChart = useUpdateLayoutSectionForChart(params)

    const onSelect = useCallback(
        (chartId: string) => {
            updateSectionForChart(chartId, (section) => ({
                ...section,
                items: section.items.map((item) => ({
                    ...item,
                    visibility: item.chartId === chartId,
                })),
            }))
        },
        [updateSectionForChart],
    )

    return { onSelect }
}
