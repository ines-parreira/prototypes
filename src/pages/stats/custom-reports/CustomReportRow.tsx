import React, {Children, PropsWithChildren} from 'react'

import {useGridSize} from 'hooks/useGridSize'

import {CustomReportRowSchema} from 'pages/stats/custom-reports/types'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

type Props = {
    schema: CustomReportRowSchema
}

export const CustomReportRow = ({
    children,
    schema,
}: PropsWithChildren<Props>) => {
    const getGridCellSize = useGridSize()

    return (
        <DashboardSection>
            {Children.toArray(children).map((child, index) => (
                <DashboardGridCell
                    key={schema.children[index].config_id}
                    size={getGridCellSize(
                        Math.round(12 / (schema.children.length % 12))
                    )}
                >
                    {child}
                </DashboardGridCell>
            ))}
        </DashboardSection>
    )
}
