import type {
    AnalyticsManagedDashboardConfig,
    Item,
    Section,
} from '@gorgias/helpdesk-types'

import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
    SectionType,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export function layoutConfigToBackendConfig(
    dashboardId: string,
    layoutConfig: DashboardLayoutConfig,
): AnalyticsManagedDashboardConfig {
    const sections: Section[] = layoutConfig.sections.map(
        (section: LayoutSection): Section => {
            return {
                section_id: section.id,
                type: mapSectionType(section.type),
                items: section.items.map(
                    (item): Item => ({
                        chart_id: item.chartId,
                        metadata: {
                            visible: item.visibility,
                            grid_size: item.gridSize,
                        },
                    }),
                ),
            }
        },
    )

    return {
        id: dashboardId,
        tabs: [
            {
                id: 'tab_main',
                name: 'Main',
                sections,
            },
        ],
    }
}

export function backendConfigToLayoutConfig(
    backendConfig: AnalyticsManagedDashboardConfig,
    defaultConfig: DashboardLayoutConfig,
): DashboardLayoutConfig {
    const mainTab = backendConfig.tabs[0]

    if (!mainTab) {
        return defaultConfig
    }

    const sections: LayoutSection[] = mainTab.sections.map(
        (backendSection: Section): LayoutSection => {
            return {
                id: backendSection.section_id,
                type: mapSectionTypeFromBackend(
                    backendSection.type as 'card' | 'graph' | 'table',
                ),
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

function mapSectionType(frontendType: SectionType): 'card' | 'graph' | 'table' {
    switch (frontendType) {
        case 'kpis':
            return 'card'
        case 'charts':
            return 'graph'
        case 'table':
            return 'table'
    }
}

function mapSectionTypeFromBackend(
    backendType: 'card' | 'graph' | 'table',
): SectionType {
    switch (backendType) {
        case 'card':
            return 'kpis'
        case 'graph':
            return 'charts'
        case 'table':
            return 'table'
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

        const savedChartIds = new Set(savedSection.items.map((i) => i.chartId))
        const missingItems = defaultSection.items.filter(
            (item) => !savedChartIds.has(item.chartId),
        )

        return {
            ...savedSection,
            items: [...savedSection.items, ...missingItems],
        }
    })

    const missingSections = defaultConfig.sections.filter(
        (defaultSection) => !savedSectionIds.has(defaultSection.id),
    )

    return {
        sections: [...mergedSections, ...missingSections],
    }
}
