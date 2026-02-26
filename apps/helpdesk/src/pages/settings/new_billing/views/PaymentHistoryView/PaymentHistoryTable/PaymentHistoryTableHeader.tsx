import type { Table } from '@gorgias/axiom'
import { HeaderRowGroup, TableHeader } from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

type PaymentHistoryTableHeaderProps = {
    table: Table<Invoice>
}

export const PaymentHistoryTableHeader = ({
    table,
}: PaymentHistoryTableHeaderProps) => {
    return (
        <TableHeader>
            <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
        </TableHeader>
    )
}
