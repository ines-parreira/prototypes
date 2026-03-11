import { Skeleton } from '@gorgias/axiom'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import css from './RecordsTable.less'

const CELL_COUNT = 4
const ROW_COUNT = 3

export default function RecordsTableSkeleton() {
    return (
        <>
            {Array.from({ length: ROW_COUNT }, (_, index) => (
                <TableBodyRow key={index}>
                    {Array.from({ length: CELL_COUNT }, (_, cellIndex) => (
                        <BodyCell key={`row-${index}-cell-${cellIndex}`}>
                            <Skeleton
                                height={16}
                                containerClassName={css.skeletonCell}
                            />
                        </BodyCell>
                    ))}
                </TableBodyRow>
            ))}
        </>
    )
}
