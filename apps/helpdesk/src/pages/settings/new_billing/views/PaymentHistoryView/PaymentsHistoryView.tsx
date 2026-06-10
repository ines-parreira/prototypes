import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { AxiosError } from 'axios'
import { useLocation } from 'react-router'
import { useCallbackRef, useEffectOnce } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import type { Invoice } from 'state/billing/types'

import { useInvoicePayment } from './hooks/useInvoicePayment'
import { PaymentHistoryTable } from './PaymentHistoryTable'

import css from './PaymentHistoryView.less'

const PaymentsHistoryView = () => {
    const { pathname } = useLocation()

    const {
        confirmPayment: confirmPaymentPrimitive,
        retryPayment: retryPaymentPrimitive,
        invoiceBeingPaid,
        invoices,
        isLoading,
        hasNextPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
    } = useInvoicePayment()

    const [descriptionNode, setDescriptionNode] = useCallbackRef()
    useInjectStyleToCandu(descriptionNode)

    useEffectOnce(() => {
        logEvent(SegmentEvent.BillingPaymentHistoryTabVisited, {
            url: pathname,
        })
    })

    const confirmPayment = useCallback(
        async (invoice: Invoice) => {
            try {
                await confirmPaymentPrimitive(invoice)
            } catch (error) {
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>
                const errorMsg =
                    responseError.response?.data.error?.msg ||
                    'Failed to confirm the payment. Please try again in a few seconds.'

                toast.error(errorMsg)
            }
        },
        [confirmPaymentPrimitive],
    )

    const retryPayment = useCallback(
        async (invoice: Invoice) => {
            try {
                await retryPaymentPrimitive(invoice)
            } catch (error) {
                const responseError = error as AxiosError<{
                    error?: { msg: string }
                }>
                const errorMsg =
                    responseError.response?.data.error?.msg ||
                    'Failed to pay the invoice. Please try again in a few seconds.'

                toast.error(errorMsg)
            }
        },
        [retryPaymentPrimitive],
    )

    return (
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
            <PaymentHistoryTable
                invoices={invoices}
                isLoading={isLoading}
                invoiceBeingPaid={invoiceBeingPaid}
                confirmPayment={confirmPayment}
                retryPayment={retryPayment}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onNextPage={goToNextPage}
                onPrevPage={goToPrevPage}
            />
        </div>
    )
}

export default PaymentsHistoryView
