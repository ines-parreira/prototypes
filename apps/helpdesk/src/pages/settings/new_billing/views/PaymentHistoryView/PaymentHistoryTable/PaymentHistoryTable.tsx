import { useMemo } from 'react'

import {
    Box,
    Button,
    TableV1Root,
    TableV1Toolbar,
    Text,
    useTableV1,
} from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

import { getPaymentHistoryColumns } from './paymentHistoryColumns'
import type { PaymentHistoryColumnsParams } from './paymentHistoryColumns'
import { PaymentHistoryTableBody } from './PaymentHistoryTableBody'
import { PaymentHistoryTableHeader } from './PaymentHistoryTableHeader'

import css from '../PaymentHistoryView.less'

type PaymentHistoryTableProps = {
    invoices: Invoice[]
    isLoading: boolean
    hasNextPage: boolean
    hasPrevPage: boolean
    onNextPage: () => void
    onPrevPage: () => void
} & PaymentHistoryColumnsParams

export const PaymentHistoryTable = ({
    invoices,
    isLoading,
    invoiceBeingPaid,
    confirmPayment,
    retryPayment,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
}: PaymentHistoryTableProps) => {
    const columns = useMemo(
        () =>
            getPaymentHistoryColumns({
                invoiceBeingPaid,
                confirmPayment,
                retryPayment,
            }),
        [invoiceBeingPaid, confirmPayment, retryPayment],
    )

    const table = useTableV1({
        data: invoices,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
            manualSorting: false,
        },
        paginationConfig: {
            enablePagination: false,
            manualPagination: true,
            pageSize: 5,
            initialPageIndex: 0,
        },
    })

    const shouldShowPagination = hasNextPage || hasPrevPage

    return (
        <>
            <TableV1Root className={css.invoicesTable}>
                <PaymentHistoryTableHeader table={table} />
                <PaymentHistoryTableBody
                    table={table}
                    isLoading={isLoading}
                    columnCount={columns.length}
                />
            </TableV1Root>
            {shouldShowPagination && (
                <TableV1Toolbar<Invoice>
                    table={table}
                    bottomRow={{
                        right: [
                            {
                                key: 'pagination',
                                content: (
                                    <Box
                                        gap="sm"
                                        alignItems="center"
                                        flexDirection="row"
                                    >
                                        <Text
                                            size="sm"
                                            color="content-neutral-secondary"
                                        >
                                            {invoices.length} items
                                        </Text>
                                        <Button
                                            size="sm"
                                            onClick={onPrevPage}
                                            isDisabled={!hasPrevPage}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={onNextPage}
                                            isDisabled={!hasNextPage}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                ),
                            },
                        ],
                    }}
                />
            )}
        </>
    )
}
