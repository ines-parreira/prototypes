import type { TableV1Instance } from '@gorgias/axiom'
import { HeaderRowGroup, TableV1Header as TableHeader } from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

type PaymentHistoryTableHeaderProps = {
    table: TableV1Instance<Invoice>
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
