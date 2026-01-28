import type React from 'react'
import { useCallback, useMemo, useRef } from 'react'

import {
    ResponsiveGridLayout,
    useContainerWidth,
    verticalCompactor,
} from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid.less'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { getChartConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { calculateChartPositions } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import type {
    ChartLayoutMetadata,
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

    return charts.map((chart) => (
        <div key={chart.config_id}>
            <DragAndResizeChart schema={chart} dashboard={dashboard} />
        </div>
    ))
}

const DragAndResizeDashboardGrid = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    const { width, containerRef, mounted } = useContainerWidth()
    const { updateDashboardHandler } = useDashboardActions()
    const isInitialMount = useRef(true)

    const initialLayout = useMemo(() => {
        const charts = flattenCharts(dashboard.children)
        const hasSavedLayouts = charts.every((chart) => chart.metadata?.layout)

        const chartConstraints = charts.map((chart) => {
            const { chartConfig } = getComponentConfig(chart.config_id)
            const chartType = chartConfig?.chartType ?? ChartType.Card
            return getChartConstraints(chartType)
        })

        const calculatedPositions = hasSavedLayouts
            ? []
            : calculateChartPositions(chartConstraints, COLS)

        return charts.map((chart, index) => {
            const { chartConfig } = getComponentConfig(chart.config_id)
            const chartType = chartConfig?.chartType ?? ChartType.Card
            const constraints = getChartConstraints(chartType)

            const savedLayout = chart.metadata?.layout
            const calculatedPosition = calculatedPositions[index]
            const position = savedLayout || calculatedPosition

            return {
                i: chart.config_id,
                x: position.x,
                y: position.y,
                w: position.w,
                h: position.h,
                minW: constraints.min.width,
                maxW: constraints.max.width,
                minH: constraints.min.height,
                maxH: constraints.max.height,
            }
        })
    }, [dashboard])

    const saveDashboardLayout = useCallback(
        (layout: Layout) => {
            const layoutMap = new Map<string, ChartLayoutMetadata>()
            layout.forEach((item) => {
                layoutMap.set(item.i, {
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                })
            })

            const updateChildWithLayout = (
                child: DashboardChild,
            ): DashboardChild => {
                if (child.type === DashboardChildType.Chart) {
                    const savedLayout = layoutMap.get(child.config_id)
                    if (savedLayout) {
                        return {
                            ...child,
                            metadata: {
                                layout: savedLayout,
                            },
                        }
                    }
                    return child
                }

                if (
                    child.type === DashboardChildType.Row ||
                    child.type === DashboardChildType.Section
                ) {
                    return {
                        ...child,
                        children: child.children.map(updateChildWithLayout),
                    } as DashboardChild
                }

                /* istanbul ignore next: Defensive fallback for unknown child types - unreachable due to TypeScript discriminated union */
                return child
            }

            const updatedDashboard: DashboardSchema = {
                ...dashboard,
                children: dashboard.children.map(updateChildWithLayout),
            }

            updateDashboardHandler({
                dashboard: updatedDashboard,
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        },
        [dashboard, updateDashboardHandler],
    )

    const handleLayoutChange = useCallback((__layout: Layout) => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
    }, [])

    const handleDragStop = useCallback(
        (layout: Layout) => {
            saveDashboardLayout(layout)
        },
        [saveDashboardLayout],
    )

    const handleResizeStop = useCallback(
        (layout: Layout) => {
            saveDashboardLayout(layout)
        },
        [saveDashboardLayout],
    )

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
                layouts={{ lg: initialLayout }}
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
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                onBreakpointChange={handleBreakpointChange}
            >
                {renderedChildren}
            </ResponsiveGridLayout>
        </div>
    )
}

export default DragAndResizeDashboardGrid
