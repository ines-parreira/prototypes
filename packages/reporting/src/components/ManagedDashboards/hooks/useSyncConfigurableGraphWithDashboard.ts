import { useCallback } from 'react'

import { useManagedDashboardContext } from './useManagedDashboardContext'
import { useSaveConfigurableGraphSelection } from './useSaveConfigurableGraphSelection'

type Selection = { measure: string; dimension: string }

export type ChartSchemaWithGraphPreferences = {
    metadata?: {
        preferences?: {
            measures?: string[] | null
            dimensions?: string[] | null
        }
    }
}

type Params = {
    analyticsChartId?: string
    customDashboardChartSchema?: ChartSchemaWithGraphPreferences
    initialMeasure?: string
    initialDimension?: string
    onSelect?: (selection: Selection) => void
}

type Result = {
    /**
     * Stable key for remounting downstream state when the managed-dashboard
     * context resolves after the chart mounted (so saved measure/dimension
     * actually take effect).
     */
    remountKey: string
    initialMeasure: string | undefined
    initialDimension: string | undefined
    onSelect: (selection: Selection) => void
}

/**
 * Wires a configurable graph to the managed-dashboard context: pulls the
 * persisted measure/dimension as initial values and saves user changes back
 * to the dashboard. Safe to call without an `analyticsChartId` or outside a
 * `DashboardContext.Provider` — in that case it returns the original initial
 * values and a no-op save (the caller's `onSelect` is still invoked).
 */
export function useSyncConfigurableGraphWithDashboard({
    analyticsChartId,
    customDashboardChartSchema,
    initialMeasure,
    initialDimension,
    onSelect: callerOnSelect,
}: Params): Result {
    const dashboardContext = useManagedDashboardContext()
    const { onSelect: saveSelection } = useSaveConfigurableGraphSelection({
        chartId: analyticsChartId ?? '',
        dashboardId: dashboardContext?.dashboardId,
        tabId: dashboardContext?.tabId,
        tabName: dashboardContext?.tabName,
        layoutConfig: dashboardContext?.layoutConfig ?? { sections: [] },
    })

    const isActive = Boolean(analyticsChartId && dashboardContext)
    const savedItem = isActive
        ? dashboardContext?.layoutConfig?.sections
              .flatMap((s) => s.items)
              .find((item) => item.chartId === analyticsChartId)
        : undefined

    const onSelect = useCallback(
        (selection: Selection) => {
            if (isActive) {
                saveSelection(selection)
            }
            callerOnSelect?.(selection)
        },
        [isActive, saveSelection, callerOnSelect],
    )

    const schemaPreferences = customDashboardChartSchema?.metadata?.preferences
    const isCustomDashboard = customDashboardChartSchema !== undefined
    return {
        remountKey: `${analyticsChartId ?? ''}-${dashboardContext?.isLoaded ?? false}`,
        initialMeasure: isCustomDashboard
            ? (schemaPreferences?.measures?.[0] ?? initialMeasure)
            : (savedItem?.measures?.[0] ?? initialMeasure),
        initialDimension: isCustomDashboard
            ? (schemaPreferences?.dimensions?.[0] ?? initialDimension)
            : (savedItem?.dimensions?.[0] ?? initialDimension),
        onSelect,
    }
}
