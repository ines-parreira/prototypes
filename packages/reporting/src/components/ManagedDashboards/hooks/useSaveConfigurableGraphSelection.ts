import { useCallback } from 'react'

import type { DashboardLayoutConfig } from '../types'
import { useUpdateLayoutSectionForChart } from './useUpdateLayoutSectionForChart'

type Params<TChart extends string> = {
    chartId: string
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig<TChart>
}

type Selection = {
    measure: string
    dimension: string
}

export function useSaveConfigurableGraphSelection<TChart extends string>({
    chartId,
    ...rest
}: Params<TChart>): {
    onSelect: (selection: Selection) => void
} {
    const updateSectionForChart = useUpdateLayoutSectionForChart(rest)

    const onSelect = useCallback(
        ({ measure, dimension }: Selection) => {
            updateSectionForChart(chartId, (section) => ({
                ...section,
                items: section.items.map((item) =>
                    item.chartId === chartId
                        ? {
                              ...item,
                              measures: [measure],
                              dimensions: [dimension],
                          }
                        : item,
                ),
            }))
        },
        [chartId, updateSectionForChart],
    )

    return { onSelect }
}
