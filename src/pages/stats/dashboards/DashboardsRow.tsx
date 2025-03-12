import React, { ReactNode } from 'react'

import {
    DroppableGridRow,
    MoveHandler,
} from 'pages/stats/dashboards/DraggableGridCell'
import { DashboardChartSchema } from 'pages/stats/dashboards/types'
import { DashboardSectionWrapper } from 'pages/stats/DashboardSection'

export type DashboardsRowProps = {
    children: ReactNode
    charts: DashboardChartSchema[]
    onMove: MoveHandler
}

export const DashboardsRow = ({
    children,
    charts,
    onMove,
}: DashboardsRowProps) => {
    return (
        <DashboardSectionWrapper>
            <DroppableGridRow charts={charts} onMove={onMove}>
                {children}
            </DroppableGridRow>
        </DashboardSectionWrapper>
    )
}
