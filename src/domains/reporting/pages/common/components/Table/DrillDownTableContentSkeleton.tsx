import { Skeleton } from '@gorgias/merchant-ui-kit'

import { DRILL_DOWN_PER_PAGE } from 'domains/reporting/hooks/useDrillDownData'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

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
