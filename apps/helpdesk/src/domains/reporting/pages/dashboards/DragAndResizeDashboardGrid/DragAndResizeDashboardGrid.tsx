import type React from 'react'
import { useCallback, useMemo } from 'react'

import {
    noCompactor,
    ResponsiveGridLayout,
    useContainerWidth,
} from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'

import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import type {
    DashboardChild,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'

const COLS = 4

const renderDashboard = (dashboard: DashboardSchema): React.ReactNode[] => {
    const renderChildren = (children: DashboardChild[]): React.ReactNode[] =>
        children.flatMap((child: DashboardChild, index: number) => {
            switch (child.type) {
                case DashboardChildType.Row:
                case DashboardChildType.Section:
                    return renderChildren(child.children)

                case DashboardChildType.Chart:
                    return (
                        <div
                            key={`${child.type}-${index}`}
                            data-grid={{
                                x: index % COLS,
                                y: Math.floor(index / COLS),
                                w: 1,
                                h: 2,
                            }}
                        >
                            <DragAndResizeChart
                                schema={child}
                                dashboard={dashboard}
                            />
                        </div>
                    )
            }
        })

    return renderChildren(dashboard.children)
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
                compactor={noCompactor}
                onLayoutChange={handleLayoutChange}
                onBreakpointChange={handleBreakpointChange}
            >
                {renderedChildren}
            </ResponsiveGridLayout>
        </div>
    )
}

export default DragAndResizeDashboardGrid
