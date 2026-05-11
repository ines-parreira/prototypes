import { useCallback } from 'react'

import { useDashboardContext } from '../contexts/DashboardContext'

export function useSaveTableColumnVisibility(chartId: string): {
    onSaveVisibleColumns: (visibleColumns: string[]) => void
    defaultVisibleColumns: string[] | undefined
    isLoaded: boolean
    tabId: string | undefined
} {
    const context = useDashboardContext()

    const savedItem = context?.layoutConfig.sections
        .flatMap((s) => s.items)
        .find((item) => item.chartId === chartId)

    const onSaveVisibleColumns = useCallback(
        (visibleColumns: string[]) => {
            context?.saveVisibleColumns?.(chartId, visibleColumns)
        },
        [chartId, context],
    )

    return {
        onSaveVisibleColumns,
        defaultVisibleColumns: savedItem?.visibleColumns ?? undefined,
        isLoaded: context !== null ? context.isLoaded : true,
        tabId: context?.tabId,
    }
}
