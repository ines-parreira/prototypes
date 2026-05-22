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

    const defaultItemMap = new Map(
        defaultConfig.sections.flatMap((s) =>
            s.items.map((item) => [item.chartId, item]),
        ),
    )

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
                    requiresFeatureFlag: defaultItemMap.get(
                        item.chart_id as TChart,
                    )?.requiresFeatureFlag,
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

    const mergedSavedItems = savedItems
        .filter((item) => defaultItemMap.has(item.chartId))
        .map((savedItem) => ({
            ...savedItem,
            requiresFeatureFlag: defaultItemMap.get(savedItem.chartId)
                ?.requiresFeatureFlag,
        }))

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
        requiresFeatureFlag: defaultItem.requiresFeatureFlag,
        visibleColumns:
            savedItemMap.get(defaultItem.chartId)?.visibleColumns ??
            defaultItem.visibleColumns,
    }))
}

export function mergeWithDefaults<TChart extends string>(
    savedConfig: DashboardLayoutConfig<TChart>,
    defaultConfig: DashboardLayoutConfig<TChart>,
): DashboardLayoutConfig<TChart> {
    const savedSectionIds = new Set(savedConfig.sections.map((s) => s.id))
    const defaultSectionMap = new Map(
        defaultConfig.sections.map((s) => [s.id, s]),
    )

    const mergedSections = savedConfig.sections.map((savedSection) => {
        const defaultSection = defaultSectionMap.get(savedSection.id)
        if (!defaultSection) return savedSection

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

    const missingSections = defaultConfig.sections.filter(
        (defaultSection) => !savedSectionIds.has(defaultSection.id),
    )

    return {
        sections: [...mergedSections, ...missingSections],
    }
}
