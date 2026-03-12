import type {
    AnalyticsManagedDashboardConfig,
    Item,
    Section,
} from '@gorgias/helpdesk-types'

import type { ChartType } from 'domains/reporting/pages/dashboards/types'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type DashboardTab = AnalyticsManagedDashboardConfig['tabs'][number]

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

    const sections: LayoutSection[] = tab.sections.map(
        (backendSection: Section): LayoutSection => {
            return {
                id: backendSection.section_id,
                type: backendSection.type as ChartType,
                items: backendSection.items.map((item: Item) => ({
                    chartId: item.chart_id as AnalyticsChartType,
                    gridSize: (item.metadata?.grid_size ?? 3) as 3 | 6 | 12,
                    visibility: item.metadata?.visible ?? true,
                })),
            }
        },
    )

    return {
        sections,
    }
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

        const defaultChartIds = new Set(
            defaultSection.items.map((i) => i.chartId),
        )
        const validSavedItems = savedSection.items.filter((item) =>
            defaultChartIds.has(item.chartId),
        )
        const savedChartIds = new Set(validSavedItems.map((i) => i.chartId))
        const missingItems = defaultSection.items.filter(
            (item) => !savedChartIds.has(item.chartId),
        )

        return {
            ...savedSection,
            tableTitle: defaultSection.tableTitle,
            items: [...validSavedItems, ...missingItems],
        }
    })

    const missingSections = defaultConfig.sections.filter(
        (defaultSection) => !savedSectionIds.has(defaultSection.id),
    )

    return {
        sections: [...mergedSections, ...missingSections],
    }
}
