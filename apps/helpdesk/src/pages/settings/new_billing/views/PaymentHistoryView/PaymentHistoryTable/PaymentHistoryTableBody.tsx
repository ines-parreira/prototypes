import type { TableV1Instance } from '@gorgias/axiom'
import { TableBodyContent } from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

type PaymentHistoryTableBodyProps = {
    table: TableV1Instance<Invoice>
    isLoading: boolean
    columnCount: number
}

export const PaymentHistoryTableBody = ({
    table,
    isLoading,
    columnCount,
}: PaymentHistoryTableBodyProps) => {
    return (
        <TableBodyContent
            isLoading={isLoading}
            rows={table.getRowModel().rows}
            columnCount={columnCount}
            table={table}
        />
    )
}
