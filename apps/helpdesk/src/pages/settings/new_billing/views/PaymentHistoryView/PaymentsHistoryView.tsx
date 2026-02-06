import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCallbackRef, useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { AxiosError } from 'axios'
import classNames from 'classnames'
import { fromJS } from 'immutable'
import moment from 'moment'
import { useLocation } from 'react-router'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Button,
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    useTable,
} from '@gorgias/axiom'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Loader from 'pages/common/components/Loader/Loader'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import GorgiasApi from 'services/gorgiasApi'
import { fetchInvoices, updateInvoiceInList } from 'state/billing/actions'
import { getInvoices } from 'state/billing/selectors'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus } from 'state/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './PaymentHistoryView.less'

const PaymentsHistoryView = () => {
    const { pathname } = useLocation()
    const dispatch = useAppDispatch()
    const gorgiasApi = useMemo(() => new GorgiasApi(), [])
    const invoices = useAppSelector(getInvoices).toJS() as Invoice[]

    const [isLoading, setIsLoading] = useState(true)
    const [invoiceBeingPaid, setInvoiceBeingPaid] = useState<Invoice | null>(
        null,
    )
    const [descriptionNode, setDescriptionNode] = useCallbackRef()
    useInjectStyleToCandu(descriptionNode)

    useEffectOnce(() => {
        logEvent(SegmentEvent.BillingPaymentHistoryTabVisited, {
            url: pathname,
        })
    })

    useEffect(() => {
        const getInvoices = async () => {
            await fetchInvoices()(dispatch)
            setIsLoading(false)
        }
        void getInvoices()
    }, [dispatch])

    const confirmPayment = useCallback(
        async (invoice: Invoice) => {
            setInvoiceBeingPaid(invoice)

            try {
                const newInvoice: Invoice = (
                    await gorgiasApi.confirmInvoicePayment(invoice.id)
                ).toJS()
                if (newInvoice.payment_confirmation_url) {
                    window.location.href = newInvoice.payment_confirmation_url
                } else {
                    dispatch(updateInvoiceInList(fromJS(newInvoice)))
                }
            } catch (error) {
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>
                const errorMsg =
                    responseError.response?.data.error?.msg ||
                    'Failed to confirm the payment. Please try again in a few seconds.'

                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: errorMsg,
                    }),
                )
            } finally {
                setInvoiceBeingPaid(null)
            }
        },
        [gorgiasApi, dispatch],
    )

    const retryPayment = useCallback(
        async (invoice: Invoice) => {
            setInvoiceBeingPaid(invoice)

            try {
                await gorgiasApi.payInvoice(invoice.id)
                dispatch(updateInvoiceInList(fromJS(invoice)))
            } catch (error) {
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>

                if (responseError.response?.status === 402) {
                    // 402: The payment needs to be confirmed by the user.
                    await confirmPayment(invoice)
                    return
                }

                const errorMsg =
                    responseError.response?.data.error?.msg ||
                    'Failed to pay the invoice. Please try again in a few seconds.'

                dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    }),
                )
            } finally {
                setInvoiceBeingPaid(null)
            }
        },
        [gorgiasApi, dispatch, confirmPayment],
    )

    const columns = useMemo<ColumnDef<Invoice, unknown>[]>(
        () => [
            {
                id: 'date',
                accessorKey: 'date',
                header: 'Date',
                cell: (info) => {
                    return (
                        <span className={css.invoiceDate}>
                            {moment
                                .unix(info.getValue() as number)
                                .format('LL')}
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
                        <span
                            className={classNames(css.badge, css.statusUnpaid)}
                        >
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
                    const has_payment_schedules =
                        !!invoice.has_payment_schedules

                    const showRetryPaymentButton =
                        !isPaid &&
                        !has_payment_schedules &&
                        [
                            PaymentIntentStatus.RequiresSource,
                            PaymentIntentStatus.RequiresPaymentMethod,
                        ].includes(paymentIntent?.status)

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
                                    isLoading={
                                        invoice.id === invoiceBeingPaid?.id
                                    }
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
                                    isLoading={
                                        invoice.id === invoiceBeingPaid?.id
                                    }
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
        ],
        [invoiceBeingPaid, confirmPayment, retryPayment],
    )

    const table = useTable({
        data: invoices,
        columns,
        sortingConfig: {
            enableSorting: false,
            enableMultiSort: false,
        },
    })

    return isLoading ? (
        <Loader data-testid="loader" />
    ) : (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    <i className="material-icons">receipt</i>
                    Payment history
                </div>
                <div
                    className={css.description}
                    data-candu-id="payment-history"
                    ref={setDescriptionNode}
                >
                    The account owner will receive an invoice by email at the
                    start of each billing period.
                </div>
            </div>
            <TableRoot className={css.invoicesTable}>
                <TableHeader>
                    <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
                </TableHeader>
                <TableBodyContent
                    isLoading={false}
                    rows={table.getRowModel().rows}
                    columnCount={columns.length}
                    table={table}
                />
            </TableRoot>
        </div>
    )
}

export default PaymentsHistoryView
