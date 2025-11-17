import type { ReactNode } from 'react'
import React from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import css from './EmptyMigrationTableRow.less'

type Props = {
    children: ReactNode
}

export default function EmptyMigrationTableRow({ children }: Props) {
    return (
        <TableBodyRow>
            <BodyCell colSpan={3} innerClassName={css.emptyState}>
                {children}
            </BodyCell>
        </TableBodyRow>
    )
}
