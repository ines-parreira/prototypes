import type { TableV1Instance } from '@gorgias/axiom'
import { TableV1BodyContent } from '@gorgias/axiom'

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
        <TableV1BodyContent
            isLoading={isLoading}
            rows={table.getRowModel().rows}
            columnCount={columnCount}
            table={table}
        />
    )
}
