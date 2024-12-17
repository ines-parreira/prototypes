import {useMemo} from 'react'

import {AlertBannerTypes} from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from 'pages/settings/new_billing/constants'
import {useBillingStateWithSideEffects} from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'
import {isCardExpired} from 'pages/settings/new_billing/utils/isCardExpired'
import {notify} from 'state/notifications/actions'
import {NotificationStyle} from 'state/notifications/types'

export const useIsPaymentEnabled = () => {
    const dispatch = useAppDispatch()
    const {data: billingState} = useBillingStateWithSideEffects()

    return useMemo(() => {
        if (!billingState) {
            return undefined
        }

        const {
            credit_card: creditCard,
            shopify_billing: shopifyBilling,
            ach_debit_bank_account: achDebit,
            ach_credit_bank_account: achCredit,
        } = billingState.customer

        if (creditCard) {
            if (isCardExpired(creditCard)) {
                void dispatch(
                    notify({
                        message: `${creditCard.brand} credit card ending with ${creditCard.last4} is expired`,
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: BILLING_PAYMENT_CARD_PATH,
                            text: 'Change Payment Method',
                        },
                        id: 'payment-method-expired',
                    })
                )

                return false
            }

            return true
        }

        if (shopifyBilling) {
            if (shopifyBilling.subscription_id === null) {
                void dispatch(
                    notify({
                        message: 'Payment with Shopify is inactive',
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                            text: 'Activate Billing with Shopify',
                            opensInNewTab: true,
                        },
                        id: 'payment-method-expired',
                    })
                )

                return false
            }

            return true
        }

        if (achDebit || achCredit) {
            return true
        }

        void dispatch(
            notify({
                message: 'No payment method registered on your account',
                type: AlertBannerTypes.Warning,
                style: NotificationStyle.Banner,
                CTA: {
                    type: 'internal',
                    to: BILLING_PAYMENT_CARD_PATH,
                    text: 'Add a payment method',
                },
                id: 'no-payment-method',
            })
        )

        return false
    }, [billingState, dispatch])
}
