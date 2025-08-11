import { Skeleton } from '@gorgias/axiom'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import css from './RecordsTable.less'

const CELL_COUNT = 4
const ROW_COUNT = 3

export default function RecordsTableSkeleton() {
    return (
        <>
            {new Array(ROW_COUNT).fill(null).map((_, index) => (
                <TableBodyRow key={index}>
                    {new Array(CELL_COUNT).fill(null).map((_, cellIndex) => (
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
