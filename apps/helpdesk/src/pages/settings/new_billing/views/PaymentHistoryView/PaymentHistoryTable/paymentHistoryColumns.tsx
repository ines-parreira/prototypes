import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import moment from 'moment'

import { Button } from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'

import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus } from 'state/billing/types'

import css from '../PaymentHistoryView.less'

export type PaymentHistoryColumnsParams = {
    invoiceBeingPaid: Invoice | null
    confirmPayment: (invoice: Invoice) => void
    retryPayment: (invoice: Invoice) => void
}

export const getPaymentHistoryColumns = ({
    invoiceBeingPaid,
    confirmPayment,
    retryPayment,
}: PaymentHistoryColumnsParams): ColumnDef<Invoice, unknown>[] => [
    {
        id: 'date',
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
        cell: (info) => {
            return (
                <span className={css.invoiceDate}>
                    {moment.unix(info.getValue() as number).format('LL')}
                </span>
            )
        },
    },
    {
        id: 'total',
        accessorKey: 'total',
        header: 'Amount',
        cell: (info) => {
            return formatAmount((info.getValue() as number) / 100)
        },
    },
    {
        id: 'amount_due',
        accessorKey: 'amount_due',
        header: 'Amount Due',
        cell: (info) => {
            return formatAmount((info.getValue() as number) / 100)
        },
    },
    {
        id: 'amount_paid',
        accessorKey: 'amount_paid',
        header: 'Amount Paid',
        cell: (info) => {
            return formatAmount((info.getValue() as number) / 100)
        },
    },
    {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => {
            return (
                <span className={css.invoiceDescription}>
                    {info.getValue() as string}
                </span>
            )
        },
    },
    {
        id: 'status',
        accessorKey: 'paid',
        header: 'Status',
        cell: (info) => {
            const isPaid = info.getValue() as boolean
            return isPaid ? (
                <span className={classNames(css.badge, css.statusPaid)}>
                    Paid
                </span>
            ) : (
                <span className={classNames(css.badge, css.statusUnpaid)}>
                    Unpaid
                </span>
            )
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
            const invoice = info.row.original
            const isPaid = invoice.paid
            const paymentIntent = invoice.payment_intent
            const has_payment_schedules = !!invoice.has_payment_schedules

            const showRetryPaymentButton =
                !isPaid &&
                !has_payment_schedules &&
                paymentIntent?.status &&
                [
                    PaymentIntentStatus.RequiresSource,
                    PaymentIntentStatus.RequiresPaymentMethod,
                ].includes(paymentIntent.status)

            return (
                <div className={css.actions}>
                    <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.downloadLink}
                        onClick={() => {
                            logEvent(
                                SegmentEvent.BillingPaymentHistoryDownloadPdfClicked,
                            )
                        }}
                    >
                        Download PDF
                    </a>
                    {paymentIntent?.status ===
                        PaymentIntentStatus.RequiresConfirmation && (
                        <Button
                            intent="regular"
                            isLoading={invoice.id === invoiceBeingPaid?.id}
                            onClick={() => {
                                void confirmPayment(invoice)
                            }}
                        >
                            Confirm
                        </Button>
                    )}
                    {showRetryPaymentButton && (
                        <Button
                            intent="regular"
                            isLoading={invoice.id === invoiceBeingPaid?.id}
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.BillingPaymentHistoryRetryPaymentClicked,
                                )
                                void retryPayment(invoice)
                            }}
                        >
                            Retry Payment
                        </Button>
                    )}
                </div>
            )
        },
    },
]
