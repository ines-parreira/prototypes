import { AnalyticsOverviewReportConfig } from '../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import type {
    DashboardLayoutConfig,
    GridSize,
    LayoutItem,
    LayoutSection,
} from '../types/layoutConfig'

const VALID_GRID_SIZES: GridSize[] = [3, 6, 12]

const isValidGridSize = (size: number): size is GridSize => {
    return VALID_GRID_SIZES.includes(size as GridSize)
}

const validateLayoutItem = (item: LayoutItem): boolean => {
    if (!item.chartId || typeof item.chartId !== 'string') {
        return false
    }

    if (!AnalyticsOverviewReportConfig.charts[item.chartId]) {
        return false
    }

    if (!isValidGridSize(item.gridSize)) {
        return false
    }

    return true
}

const validateLayoutSection = (section: LayoutSection): boolean => {
    if (!section.id || typeof section.id !== 'string') {
        return false
    }

    if (!section.type || !['kpis', 'charts', 'table'].includes(section.type)) {
        return false
    }

    if (!Array.isArray(section.items)) {
        return false
    }

    return section.items.every(validateLayoutItem)
}

export const validateLayoutConfig = (
    config: DashboardLayoutConfig,
): DashboardLayoutConfig => {
    if (!config || typeof config !== 'object') {
        return DEFAULT_ANALYTICS_OVERVIEW_LAYOUT
    }

    if (!Array.isArray(config.sections)) {
        return DEFAULT_ANALYTICS_OVERVIEW_LAYOUT
    }

    const isValid = config.sections.every(validateLayoutSection)

    if (!isValid) {
        return DEFAULT_ANALYTICS_OVERVIEW_LAYOUT
    }

    return config
}
