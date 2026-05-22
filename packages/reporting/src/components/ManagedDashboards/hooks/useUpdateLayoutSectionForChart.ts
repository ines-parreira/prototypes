import { useCallback } from 'react'

import type { DashboardLayoutConfig, LayoutSection } from '../types'
import { useUpdateManagedDashboard } from './useUpdateManagedDashboard'

type Params<TChart extends string> = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig<TChart>
}

type SectionUpdater<TChart extends string> = (
    section: LayoutSection<TChart>,
) => LayoutSection<TChart>

/**
 * Returns a function that locates the layout section containing the given
 * chartId and dispatches a section-level transformation through
 * `useUpdateManagedDashboard`. It's a no-op when any of dashboardId / tabId /
 * tabName is missing, or when no section contains the chartId.
 */
export function useUpdateLayoutSectionForChart<TChart extends string>({
    dashboardId,
    tabId,
    tabName,
    layoutConfig,
}: Params<TChart>) {
    const { updateSection } = useUpdateManagedDashboard({ silent: true })

    return useCallback(
        (chartId: string, sectionUpdater: SectionUpdater<TChart>) => {
            if (!dashboardId || !tabId || !tabName) return

            const section = layoutConfig.sections.find((s) =>
                s.items.some((item) => item.chartId === chartId),
            )
            if (!section) return

            updateSection(
                dashboardId,
                tabId,
                tabName,
                layoutConfig,
                section.id,
                sectionUpdater,
            )
        },
        [dashboardId, tabId, tabName, layoutConfig, updateSection],
    )
}
