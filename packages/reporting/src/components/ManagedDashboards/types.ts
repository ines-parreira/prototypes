import type { ComponentType, ReactNode } from 'react'

export const ChartType = {
    Card: 'card',
    CardWithTimeseries: 'card-with-timeseries',
    Graph: 'graph',
    Table: 'table',
} as const

export type ChartType = (typeof ChartType)[keyof typeof ChartType]

export type GridSize = 3 | 6 | 12

export type LayoutItem<TChart extends string = string> = {
    chartId: TChart
    gridSize: GridSize
    visibility: boolean
    requiresFeatureFlag?: boolean
    dimensions?: string[] | null
    measures?: string[] | null
    visibleColumns?: string[] | null
}

export type LayoutSection<TChart extends string = string> = {
    id: string
    type: ChartType
    tableTitle?: string
    items: LayoutItem<TChart>[]
}

export type DashboardLayoutConfig<TChart extends string = string> = {
    sections: LayoutSection<TChart>[]
}

export type LayoutChartConfig = {
    label: string
}

export type LayoutReportConfig<TChart extends string = string> = {
    charts: Record<TChart, LayoutChartConfig>
}

export type DashboardComponentProps<TChart extends string = string> = {
    chart: TChart
    config: any
    dashboard?: any
    withChartMenu?: boolean
}

export type ChartsActionMenuProps = {
    chartId: string
    chartName: ReactNode
    dashboard?: any
}

export type DashboardComponentType<TChart extends string = string> =
    ComponentType<DashboardComponentProps<TChart>>

export type ChartsActionMenuType = ComponentType<ChartsActionMenuProps>

export type ManagedDashboardContextValue<TChart extends string = string> = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig<TChart>
    isLoaded: boolean
}
