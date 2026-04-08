import type { TableV1Instance } from '@gorgias/axiom'
import {
    TableV1Header as TableHeader,
    TableV1HeaderRowGroup,
} from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

type PaymentHistoryTableHeaderProps = {
    table: TableV1Instance<Invoice>
}

export const PaymentHistoryTableHeader = ({
    table,
}: PaymentHistoryTableHeaderProps) => {
    return (
        <TableHeader>
            <TableV1HeaderRowGroup headerGroups={table.getHeaderGroups()} />
        </TableHeader>
    )
}
