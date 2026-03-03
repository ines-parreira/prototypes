import type React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import {
    ResponsiveGridLayout,
    useContainerWidth,
    verticalCompactor,
} from 'react-grid-layout'
import type { Breakpoint, Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { getChartConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { calculateChartPositionsWithOccupied } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'
import type { OccupiedGrid } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import css from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid.less'
import {
    GRID_BREAKPOINTS,
    GRID_COLS,
} from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/gridBreakpoints'
import { clampLayoutToConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/layoutUtils'
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
import { flattenCharts } from 'domains/reporting/pages/dashboards/utils'

const COLS = 12

const renderDashboard = (dashboard: DashboardSchema): React.ReactNode[] => {
    const charts = flattenCharts(dashboard.children)

    return charts.map((chart) => (
        <div key={chart.config_id}>
            <div className="drag-handle" aria-hidden="true" />
            <DragAndResizeChart schema={chart} dashboard={dashboard} />
        </div>
    ))
}

export const DragAndResizeDashboardGrid = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    const { width, containerRef, mounted } = useContainerWidth()
    const { updateDashboardHandler } = useDashboardActions()
    const isInitialMount = useRef(true)
    const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')

    const initialLayout = useMemo(() => {
        const charts = flattenCharts(dashboard.children)

        const chartsWithLayouts: DashboardChartSchema[] = []
        const chartsWithoutLayouts: DashboardChartSchema[] = []
        const chartsWithoutLayoutsConstraints: ReturnType<
            typeof getChartConstraints
        >[] = []

        charts.forEach((chart) => {
            if (chart.metadata?.layout) {
                chartsWithLayouts.push(chart)
            } else {
                chartsWithoutLayouts.push(chart)
                const { chartConfig } = getComponentConfig(chart.config_id)
                const chartType = chartConfig?.chartType ?? ChartType.Card
                chartsWithoutLayoutsConstraints.push(
                    getChartConstraints(chartType),
                )
            }
        })

        const occupiedGrid: OccupiedGrid = new Set()
        chartsWithLayouts.forEach((chart) => {
            const layout = chart.metadata!.layout!
            for (let row = layout.y; row < layout.y + layout.h; row++) {
                for (let col = layout.x; col < layout.x + layout.w; col++) {
                    occupiedGrid.add(`${col},${row}`)
                }
            }
        })

        const newChartPositions = calculateChartPositionsWithOccupied(
            chartsWithoutLayoutsConstraints,
            COLS,
            occupiedGrid,
        )

        const layoutMap = new Map<string, ChartLayoutMetadata>()

        chartsWithLayouts.forEach((chart) => {
            layoutMap.set(chart.config_id, chart.metadata!.layout!)
        })

        chartsWithoutLayouts.forEach((chart, index) => {
            layoutMap.set(chart.config_id, newChartPositions[index])
        })

        return charts.map((chart) => {
            const { chartConfig } = getComponentConfig(chart.config_id)
            const chartType = chartConfig?.chartType ?? ChartType.Card
            const constraints = getChartConstraints(chartType)

            const position = layoutMap.get(chart.config_id)!
            const clampedPosition = clampLayoutToConstraints(
                position,
                constraints,
                COLS,
            )

            return {
                i: chart.config_id,
                x: clampedPosition.x,
                y: clampedPosition.y,
                w: clampedPosition.w,
                h: clampedPosition.h,
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
            if (currentBreakpoint !== 'lg') {
                return
            }
            saveDashboardLayout(layout)
        },
        [saveDashboardLayout, currentBreakpoint],
    )

    const handleResizeStop = useCallback(
        (layout: Layout) => {
            if (currentBreakpoint !== 'lg') {
                return
            }
            saveDashboardLayout(layout)
        },
        [saveDashboardLayout, currentBreakpoint],
    )

    const handleBreakpointChange = useCallback(
        (breakpoint: string, __cols: number) => {
            setCurrentBreakpoint(breakpoint)
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
            className={css.dashboardGridContainer}
            style={{ width: '100%' }}
            data-drag-enabled={currentBreakpoint === 'lg'}
        >
            <ResponsiveGridLayout
                width={width}
                layouts={{ lg: initialLayout }}
                breakpoints={GRID_BREAKPOINTS}
                cols={GRID_COLS}
                rowHeight={20}
                containerPadding={[24, 24]}
                dragConfig={{
                    enabled: currentBreakpoint === 'lg',
                    handle: '.drag-handle',
                }}
                resizeConfig={{
                    enabled: currentBreakpoint === 'lg',
                    handles: ['se'],
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
