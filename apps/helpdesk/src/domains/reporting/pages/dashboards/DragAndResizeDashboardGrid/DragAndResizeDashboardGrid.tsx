import React from 'react'

import { Responsive, WidthProvider } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'

import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

const COLS = 4

const renderDashboard = (dashboard: DashboardSchema): React.ReactNode[] => {
    const renderChildren = (children: DashboardChild[]): React.ReactNode[] =>
        children.map((child: DashboardChild, index: number) => {
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

const ResponsiveGridLayout = WidthProvider(Responsive)

const DragAndResizeDashboardGrid = ({
    dashboard,
}: {
    dashboard: DashboardSchema
}) => {
    return (
        <ResponsiveGridLayout
            cols={{ lg: 4, md: 4, sm: 3, xs: 2, xxs: 1 }}
            rowHeight={40}
            isDraggable
            isResizable
            preventCollision={true}
            compactType={null}
            containerPadding={[25, 20]}
        >
            {renderDashboard(dashboard)}
        </ResponsiveGridLayout>
    )
}

export default DragAndResizeDashboardGrid
