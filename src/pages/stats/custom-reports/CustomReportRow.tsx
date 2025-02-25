import React, { ReactNode } from 'react'

import { CustomReportChartSchema } from 'models/stat/types'
import {
    DroppableGridRow,
    MoveHandler,
} from 'pages/stats/custom-reports/DraggableGridCell'
import { DashboardSectionWrapper } from 'pages/stats/DashboardSection'

export type CustomReportRowProps = {
    children: ReactNode
    charts: CustomReportChartSchema[]
    onMove: MoveHandler
}

export const CustomReportRow = ({
    children,
    charts,
    onMove,
}: CustomReportRowProps) => {
    return (
        <DashboardSectionWrapper>
            <DroppableGridRow charts={charts} onMove={onMove}>
                {children}
            </DroppableGridRow>
        </DashboardSectionWrapper>
    )
}
