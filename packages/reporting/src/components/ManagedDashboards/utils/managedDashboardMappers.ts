import type {
    AnalyticsManagedDashboardConfig,
    Item,
    Section,
} from '@gorgias/helpdesk-types'

import { ChartType } from '../types'
import type { DashboardLayoutConfig, GridSize, LayoutSection } from '../types'

type DashboardTab = AnalyticsManagedDashboardConfig['tabs'][number]

function layoutConfigToTabSections<TChart extends string>(
    layoutConfig: DashboardLayoutConfig<TChart>,
): Section[] {
    return layoutConfig.sections.map(
        (section): Section => ({
            section_id: section.id,
            type: section.type,
            items: section.items.map(
                (item): Item => ({
                    chart_id: item.chartId,
                    metadata: {
                        visible: item.visibility,
                        grid_size: item.gridSize,
                        measures: item.measures,
                        dimensions: item.dimensions,
                        columns:
                            item.visibleColumns?.map((id) => ({
                                column_id: id,
                                visible: true,
                            })) ?? undefined,
                    },
                }),
            ),
        }),
    )
}

export function layoutConfigToBackendConfig<TChart extends string>(
    dashboardId: string,
    layoutConfig: DashboardLayoutConfig<TChart>,
    tabId: string,
    tabName: string,
): AnalyticsManagedDashboardConfig {
    return {
        id: dashboardId,
        tabs: [
            {
                id: tabId,
                name: tabName,
                sections: layoutConfigToTabSections(layoutConfig),
            },
        ],
    }
}

export function buildDashboardConfig<TChart extends string>(
    dashboardId: string,
    tabId: string,
    tabName: string,
    layoutConfig: DashboardLayoutConfig<TChart>,
    existingConfig?: AnalyticsManagedDashboardConfig,
): AnalyticsManagedDashboardConfig {
    const sections = layoutConfigToTabSections(layoutConfig)
    const updatedTab: DashboardTab = { id: tabId, name: tabName, sections }

    if (!existingConfig) {
        return { id: dashboardId, tabs: [updatedTab] }
    }

    const existingTabIndex = existingConfig.tabs.findIndex(
        (t) => t.id === tabId,
    )

    if (existingTabIndex === -1) {
        return {
            ...existingConfig,
            tabs: [...existingConfig.tabs, updatedTab],
        }
    }

    return {
        ...existingConfig,
        tabs: existingConfig.tabs.map((t) => (t.id === tabId ? updatedTab : t)),
    }
}

export function backendConfigToLayoutConfig<TChart extends string>(
    backendConfig: AnalyticsManagedDashboardConfig,
    defaultConfig: DashboardLayoutConfig<TChart>,
    tabId: string,
): DashboardLayoutConfig<TChart> {
    const tab = backendConfig.tabs.find((t) => t.id === tabId)

    if (!tab) {
        return defaultConfig
    }

    const sections: LayoutSection<TChart>[] = tab.sections.map(
        (backendSection: Section): LayoutSection<TChart> => {
            return {
                id: backendSection.section_id,
                type: backendSection.type as ChartType,
                items: backendSection.items.map((item: Item) => ({
                    chartId: item.chart_id as TChart,
                    gridSize: (item.metadata?.grid_size ?? 3) as GridSize,
                    visibility: item.metadata?.visible ?? true,
                    measures: item.metadata?.measures,
                    dimensions: item.metadata?.dimensions,
                    visibleColumns:
                        item.metadata?.columns
                            ?.filter((c) => c.visible)
                            .map((c) => c.column_id) ?? undefined,
                })),
            }
        },
    )

    return {
        sections,
    }
}

function mergeItemsPreservingSavedOrder<TChart extends string>(
    savedItems: LayoutSection<TChart>['items'],
    defaultItems: LayoutSection<TChart>['items'],
): LayoutSection<TChart>['items'] {
    const defaultItemMap = new Map(
        defaultItems.map((item) => [item.chartId, item]),
    )
    const savedItemIds = new Set(savedItems.map((item) => item.chartId))

    const mergedSavedItems = savedItems.filter((item) =>
        defaultItemMap.has(item.chartId),
    )

    const newDefaultItems = defaultItems.filter(
        (item) => !savedItemIds.has(item.chartId),
    )

    return [...mergedSavedItems, ...newDefaultItems]
}

function mergeItemsPreservingDefaultOrder<TChart extends string>(
    savedItems: LayoutSection<TChart>['items'],
    defaultItems: LayoutSection<TChart>['items'],
): LayoutSection<TChart>['items'] {
    const savedItemMap = new Map(savedItems.map((item) => [item.chartId, item]))

    return defaultItems.map((defaultItem) => ({
        ...(savedItemMap.get(defaultItem.chartId) ?? defaultItem),
        visibleColumns:
            savedItemMap.get(defaultItem.chartId)?.visibleColumns ??
            defaultItem.visibleColumns,
    }))
}

export function mergeWithDefaults<TChart extends string>(
    savedConfig: DashboardLayoutConfig<TChart>,
    defaultConfig: DashboardLayoutConfig<TChart>,
): DashboardLayoutConfig<TChart> {
    const savedSectionMap = new Map(savedConfig.sections.map((s) => [s.id, s]))

    // Follow the default section order so that sections introduced in a later
    // release land at their intended position for users who already have a
    // persisted layout, instead of being appended after their saved sections.
    // Saved sections that no longer exist in the defaults are dropped.
    const orderedSections = defaultConfig.sections.map((defaultSection) => {
        const savedSection = savedSectionMap.get(defaultSection.id)
        if (!savedSection) return defaultSection

        const mergeItems =
            savedSection.type === ChartType.Card
                ? mergeItemsPreservingSavedOrder
                : mergeItemsPreservingDefaultOrder

        return {
            ...savedSection,
            tableTitle: defaultSection.tableTitle,
            items: mergeItems(savedSection.items, defaultSection.items),
        }
    })

    return {
        sections: orderedSections,
    }
}
