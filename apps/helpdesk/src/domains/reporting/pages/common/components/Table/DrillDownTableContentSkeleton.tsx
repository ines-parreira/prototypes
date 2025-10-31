import { Skeleton } from '@gorgias/axiom'

import { DRILL_DOWN_PER_PAGE } from 'domains/reporting/hooks/useDrillDownData'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

export const DrillDownTableContentSkeleton = ({
    columnWidths,
    rowCount,
}: {
    columnWidths: number[]
    rowCount?: number
}) => {
    const numberOfRows = rowCount ?? DRILL_DOWN_PER_PAGE

    return (
        <>
            {Array.from({ length: numberOfRows })
                .fill(null)
                .map((_, rowIndex) => (
                    <TableBodyRow key={`row-${rowIndex}`}>
                        {columnWidths.map((width, colIndex) => (
                            <BodyCell key={`col-${colIndex}-row-${rowIndex}`}>
                                <Skeleton inline width={width} height={32} />
                            </BodyCell>
                        ))}
                    </TableBodyRow>
                ))}
        </>
    )
}
