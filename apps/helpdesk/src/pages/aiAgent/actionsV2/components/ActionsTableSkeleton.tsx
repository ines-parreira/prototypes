import { BodyCell } from 'pages/common/components/table/cells/BodyCell'
import { DefaultExportTableBody as TableBody } from 'pages/common/components/table/TableBody'
import { DefaultExportTableBodyRow as TableBodyRow } from 'pages/common/components/table/TableBodyRow'

import { Skeleton } from '@gorgias/axiom'

import { ACTION_LIBRARY_APP_COLUMN_WIDTH } from '../constants'

type Props = {
    rows: number
}

const ActionsTableSkeleton = ({ rows }: Props) => {
    return (
        <TableBody aria-hidden="true">
            {Array.from({ length: rows }, (_, idx) => (
                <TableBodyRow key={idx}>
                    <BodyCell
                        width={ACTION_LIBRARY_APP_COLUMN_WIDTH}
                        justifyContent="right"
                    >
                        <Skeleton
                            height={24}
                            width={24}
                            style={{ borderRadius: '50%' }}
                        />
                    </BodyCell>
                    <BodyCell width={320} isLoading />
                    <BodyCell width="100%" aria-hidden="true" />
                    <BodyCell width={100} isLoading />
                    <BodyCell width={110} isLoading />
                    <BodyCell width={180} isLoading />
                    <BodyCell width={56} isLoading />
                </TableBodyRow>
            ))}
        </TableBody>
    )
}

export { ActionsTableSkeleton }
