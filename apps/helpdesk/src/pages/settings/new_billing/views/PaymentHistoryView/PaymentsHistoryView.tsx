import { useCallback } from 'react'

import { useCallbackRef, useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { AxiosError } from 'axios'
import { useLocation } from 'react-router'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useAppDispatch from 'hooks/useAppDispatch'
import type { Invoice } from 'state/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useInvoicePayment } from './hooks/useInvoicePayment'
import { PaymentHistoryTable } from './PaymentHistoryTable'

import css from './PaymentHistoryView.less'

const PaymentsHistoryView = () => {
    const { pathname } = useLocation()
    const dispatch = useAppDispatch()

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

                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: errorMsg,
                    }),
                )
            }
        },
        [confirmPaymentPrimitive, dispatch],
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

                await dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [dispatch, retryPaymentPrimitive],
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
