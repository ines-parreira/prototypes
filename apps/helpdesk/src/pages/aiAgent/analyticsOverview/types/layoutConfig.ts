import type { AnalyticsOverviewChart } from '../AnalyticsOverviewReportConfig'

export type SectionType = 'kpis' | 'charts' | 'table'

export type GridSize = 3 | 6 | 12

export type LayoutItem = {
    chartId: AnalyticsOverviewChart
    gridSize: GridSize
}

export type LayoutSection = {
    id: string
    type: SectionType
    items: LayoutItem[]
}

export type DashboardLayoutConfig = {
    sections: LayoutSection[]
}
