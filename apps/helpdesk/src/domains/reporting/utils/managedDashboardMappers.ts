import type {
    AnalyticsManagedDashboardConfig,
    Item,
    Section,
} from '@gorgias/helpdesk-types'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type DashboardTab = AnalyticsManagedDashboardConfig['tabs'][number]

type LayoutItem = LayoutSection['items'][number]

function layoutConfigToTabSections(
    layoutConfig: DashboardLayoutConfig,
): Section[] {
    return layoutConfig.sections.map(
        (section: LayoutSection): Section => ({
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
                    },
                }),
            ),
        }),
    )
}

export function layoutConfigToBackendConfig(
    dashboardId: string,
    layoutConfig: DashboardLayoutConfig,
    tabId: ManagedDashboardsTabId,
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

export function buildDashboardConfig(
    dashboardId: string,
    tabId: ManagedDashboardsTabId,
    tabName: string,
    layoutConfig: DashboardLayoutConfig,
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

export function backendConfigToLayoutConfig(
    backendConfig: AnalyticsManagedDashboardConfig,
    defaultConfig: DashboardLayoutConfig,
    tabId: ManagedDashboardsTabId,
): DashboardLayoutConfig {
    const tab = backendConfig.tabs.find((t) => t.id === tabId)

    if (!tab) {
        return defaultConfig
    }

    const defaultItemMap = new Map(
        defaultConfig.sections.flatMap((s) =>
            s.items.map((item) => [item.chartId, item]),
        ),
    )

    const sections: LayoutSection[] = tab.sections.map(
        (backendSection: Section): LayoutSection => {
            return {
                id: backendSection.section_id,
                type: backendSection.type as ChartType,
                items: backendSection.items.map((item: Item) => ({
                    chartId: item.chart_id as AnalyticsChartType,
                    gridSize: (item.metadata?.grid_size ?? 3) as 3 | 6 | 12,
                    visibility: item.metadata?.visible ?? true,
                    measures: item.metadata?.measures,
                    dimensions: item.metadata?.dimensions,
                    requiresFeatureFlag: defaultItemMap.get(
                        item.chart_id as AnalyticsChartType,
                    )?.requiresFeatureFlag,
                })),
            }
        },
    )

    return {
        sections,
    }
}

function mergeItemsPreservingSavedOrder(
    savedItems: LayoutItem[],
    defaultItems: LayoutItem[],
): LayoutItem[] {
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

function mergeItemsPreservingDefaultOrder(
    savedItems: LayoutItem[],
    defaultItems: LayoutItem[],
): LayoutItem[] {
    const savedItemMap = new Map(savedItems.map((item) => [item.chartId, item]))

    return defaultItems.map((defaultItem) => ({
        ...(savedItemMap.get(defaultItem.chartId) ?? defaultItem),
        requiresFeatureFlag: defaultItem.requiresFeatureFlag,
    }))
}

export function mergeWithDefaults(
    savedConfig: DashboardLayoutConfig,
    defaultConfig: DashboardLayoutConfig,
): DashboardLayoutConfig {
    const savedSectionIds = new Set(savedConfig.sections.map((s) => s.id))
    const defaultSectionMap = new Map(
        defaultConfig.sections.map((s) => [s.id, s]),
    )

    const mergedSections = savedConfig.sections.map((savedSection) => {
        const defaultSection = defaultSectionMap.get(savedSection.id)
        if (!defaultSection) return savedSection

        // for card sections, we want to allow persistent re-ordering of items
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
