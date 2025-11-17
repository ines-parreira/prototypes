import type { ReactNode } from 'react'
import React from 'react'

import { DashboardSectionWrapper } from 'domains/reporting/pages/common/layout/DashboardSection'
import type { MoveHandler } from 'domains/reporting/pages/dashboards/DraggableGridCell'
import { DroppableGridRow } from 'domains/reporting/pages/dashboards/DraggableGridCell'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'

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
