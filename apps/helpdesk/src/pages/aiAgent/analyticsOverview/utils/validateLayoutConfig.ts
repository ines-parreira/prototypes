import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    GridSize,
    LayoutItem,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const VALID_GRID_SIZES: GridSize[] = [3, 6, 12]

const isValidGridSize = (size: number): size is GridSize => {
    return VALID_GRID_SIZES.includes(size as GridSize)
}

const validateLayoutItem = <TChart extends AnalyticsChartType>(
    item: LayoutItem<any>,
    reportConfig: ReportConfig<TChart>,
): boolean => {
    if (!item.chartId || typeof item.chartId !== 'string') {
        return false
    }

    if (!(item.chartId in reportConfig.charts)) {
        return false
    }

    if (!isValidGridSize(item.gridSize)) {
        return false
    }

    return true
}

const validateLayoutSection = <TChart extends AnalyticsChartType>(
    section: LayoutSection<any>,
    reportConfig: ReportConfig<TChart>,
): boolean => {
    if (!section.id || typeof section.id !== 'string') {
        return false
    }

    if (!section.type || !['kpis', 'charts', 'table'].includes(section.type)) {
        return false
    }

    if (!Array.isArray(section.items)) {
        return false
    }

    return section.items.every((item) => validateLayoutItem(item, reportConfig))
}

export const validateLayoutConfig = <TChart extends AnalyticsChartType>(
    config: DashboardLayoutConfig<any>,
    reportConfig: ReportConfig<TChart>,
    fallbackConfig: DashboardLayoutConfig<TChart>,
): DashboardLayoutConfig<TChart> => {
    if (!config || typeof config !== 'object') {
        return fallbackConfig
    }

    if (!Array.isArray(config.sections)) {
        return fallbackConfig
    }

    const isValid = config.sections.every((section) =>
        validateLayoutSection(section, reportConfig),
    )

    if (!isValid) {
        return fallbackConfig
    }

    return config
}
