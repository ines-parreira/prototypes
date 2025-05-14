import React, { useEffect, useState } from 'react'

import { AxiosError } from 'axios'
import classNames from 'classnames'
import { fromJS } from 'immutable'
import moment from 'moment'
// eslint-disable-next-line no-restricted-imports
import { useDispatch } from 'react-redux'
import { Table } from 'reactstrap'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useAppSelector from 'hooks/useAppSelector'
import useCallbackRef from 'hooks/useCallbackRef'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import GorgiasApi from 'services/gorgiasApi'
import { fetchInvoices, updateInvoiceInList } from 'state/billing/actions'
import { getInvoices } from 'state/billing/selectors'
import { Invoice, PaymentIntentStatus } from 'state/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './PaymentHistoryView.less'

const PaymentsHistoryView = () => {
    const dispatch = useDispatch()
    const gorgiasApi = new GorgiasApi()
    const invoices = useAppSelector(getInvoices).toJS() as Invoice[]

    const [isLoading, setIsLoading] = useState(true)
    const [invoiceBeingPaid, setInvoiceBeingPaid] = useState<Invoice | null>(
        null,
    )
    const [descriptionNode, setDescriptionNode] = useCallbackRef()
    useInjectStyleToCandu(descriptionNode)

    useEffect(() => {
        const getInvoices = async () => {
            await fetchInvoices()(dispatch)
            setIsLoading(false)
        }
        void getInvoices()
    }, [dispatch])

    const retryPayment = async (invoice: Invoice) => {
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
    }

    const confirmPayment = async (invoice: Invoice) => {
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
    }

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
            {invoices.length > 0 && (
                <Table className={css.invoicesTable}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th className={css.actionsHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => {
                            const isPaid = invoice.paid
                            const paymentIntent = invoice.payment_intent

                            const showRetryPaymentButton =
                                !isPaid &&
                                [
                                    PaymentIntentStatus.RequiresSource,
                                    PaymentIntentStatus.RequiresPaymentMethod,
                                ].includes(paymentIntent?.status)

                            return (
                                <tr key={invoice.id}>
                                    <td
                                        className={classNames(
                                            'align-middle',
                                            css.invoiceDate,
                                        )}
                                    >
                                        {moment.unix(invoice.date).format('LL')}
                                    </td>
                                    <td className="align-middle">
                                        {formatAmount(invoice.amount_due / 100)}
                                    </td>
                                    <td
                                        className={classNames(
                                            'align-middle',
                                            css.invoiceDescription,
                                        )}
                                    >
                                        {invoice.description}
                                    </td>
                                    <td className="align-middle">
                                        {isPaid ? (
                                            <span
                                                className={classNames(
                                                    css.badge,
                                                    css.statusPaid,
                                                )}
                                            >
                                                Paid
                                            </span>
                                        ) : (
                                            <span
                                                className={classNames(
                                                    css.badge,
                                                    css.statusUnpaid,
                                                )}
                                            >
                                                Unpaid
                                            </span>
                                        )}
                                    </td>
                                    <td className="align-middle">
                                        <div className={css.actions}>
                                            <a
                                                href={invoice.invoice_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={css.downloadLink}
                                            >
                                                Download PDF
                                            </a>
                                            {paymentIntent?.status ===
                                                PaymentIntentStatus.RequiresConfirmation && (
                                                <Button
                                                    intent="primary"
                                                    isLoading={
                                                        invoice.id ===
                                                        invoiceBeingPaid?.id
                                                    }
                                                    onClick={() => {
                                                        void confirmPayment(
                                                            invoice,
                                                        )
                                                    }}
                                                >
                                                    Confirm
                                                </Button>
                                            )}
                                            {showRetryPaymentButton && (
                                                <Button
                                                    intent="primary"
                                                    isLoading={
                                                        invoice.id ===
                                                        invoiceBeingPaid?.id
                                                    }
                                                    onClick={() => {
                                                        void retryPayment(
                                                            invoice,
                                                        )
                                                    }}
                                                >
                                                    Retry Payment
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            )}
        </div>
    )
}

export default PaymentsHistoryView
