import type React from 'react'
import { useCallback, useMemo } from 'react'

import {
    ResponsiveGridLayout,
    useContainerWidth,
    verticalCompactor,
} from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid.less'

import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { getChartConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { calculateChartPositions } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import type {
    DashboardChartSchema,
    DashboardChild,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'

const COLS = 4

const flattenCharts = (children: DashboardChild[]): DashboardChartSchema[] => {
    return children.flatMap((child: DashboardChild) => {
        switch (child.type) {
            case DashboardChildType.Row:
            case DashboardChildType.Section:
                return flattenCharts(child.children)
            case DashboardChildType.Chart:
                return [child]
        }
    })
}

const renderDashboard = (dashboard: DashboardSchema): React.ReactNode[] => {
    const charts = flattenCharts(dashboard.children)

    const chartConstraints = charts.map((chart) => {
        const { chartConfig } = getComponentConfig(chart.config_id)
        const chartType = chartConfig?.chartType ?? ChartType.Card
        return getChartConstraints(chartType)
    })

    const positions = calculateChartPositions(chartConstraints, COLS)

    return charts.map((chart, index) => {
        const position = positions[index]
        const { chartConfig } = getComponentConfig(chart.config_id)
        const chartType = chartConfig?.chartType ?? ChartType.Card
        const constraints = getChartConstraints(chartType)

        return (
            <div
                key={`${chart.type}-${index}`}
                data-grid={{
                    i: chart.config_id,
                    x: position.x,
                    y: position.y,
                    w: position.w,
                    h: position.h,
                    minW: constraints.min.width,
                    maxW: constraints.max.width,
                    minH: constraints.min.height,
                    maxH: constraints.max.height,
                }}
            >
                <DragAndResizeChart schema={chart} dashboard={dashboard} />
            </div>
        )
    })
}

const DragAndResizeDashboardGrid = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    const { width, containerRef, mounted } = useContainerWidth()

    const handleLayoutChange = useCallback((__layout: Layout) => {
        // Layout change handler, will be implemented for persistence later
    }, [])

    const handleBreakpointChange = useCallback(
        (__breakpoint: string, __cols: number) => {
            // Breakpoint change handler
        },
        [],
    )

    const renderedChildren = useMemo(
        () => renderDashboard(dashboard),
        [dashboard],
    )

    if (!mounted) {
        return (
            <div
                ref={containerRef as React.Ref<HTMLDivElement>}
                style={{ width: '100%' }}
            />
        )
    }

    return (
        <div
            ref={containerRef as React.Ref<HTMLDivElement>}
            style={{ width: '100%' }}
        >
            <ResponsiveGridLayout
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 4, sm: 3, xs: 2, xxs: 1 }}
                rowHeight={40}
                containerPadding={[25, 20]}
                dragConfig={{
                    enabled: true,
                }}
                resizeConfig={{
                    enabled: true,
                }}
                compactor={verticalCompactor}
                onLayoutChange={handleLayoutChange}
                onBreakpointChange={handleBreakpointChange}
            >
                {renderedChildren}
            </ResponsiveGridLayout>
        </div>
    )
}

export default DragAndResizeDashboardGrid
