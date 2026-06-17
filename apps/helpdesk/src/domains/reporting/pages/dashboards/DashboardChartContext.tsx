import { createContext, useContext } from 'react'

import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

export type DashboardChartContextValue = {
    dashboard?: DashboardSchema
    schema?: DashboardChartSchema
    chartId?: string
    chartConfig?: ChartConfig
}

const DashboardChartContext = createContext<
    DashboardChartContextValue | undefined
>(undefined)
DashboardChartContext.displayName = 'DashboardChartContext'

export const DashboardChartProvider = DashboardChartContext.Provider

export const useDashboardChartContext = () => useContext(DashboardChartContext)
