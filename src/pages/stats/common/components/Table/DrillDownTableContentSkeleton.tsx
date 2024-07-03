import React from 'react'
import {DRILL_DOWN_PER_PAGE} from 'hooks/reporting/useDrillDownData'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

export const DrillDownTableContentSkeleton = ({
    columnWidths,
}: {
    columnWidths: number[]
}) => {
    return (
        <>
            {new Array(DRILL_DOWN_PER_PAGE).fill(null).map((_, rowIndex) => (
                <TableBodyRow key={`row-${rowIndex}`}>
                    {columnWidths.map((width, colIndex) => (
                        <BodyCell key={`col-${colIndex}-row-${rowIndex}`}>
                            <Skeleton inline width={width} />
                        </BodyCell>
                    ))}
                </TableBodyRow>
            ))}
        </>
    )
}
