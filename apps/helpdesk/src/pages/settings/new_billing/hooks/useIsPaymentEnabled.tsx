import { useMemo } from 'react'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { useBillingStateWithSideEffects } from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'
import { isCardExpired } from 'pages/settings/new_billing/utils/isCardExpired'

export const useIsPaymentEnabled = () => {
    const { data: billingState } = useBillingStateWithSideEffects()
    const { addBanner } = useBanners()

    return useMemo(() => {
        // During account provisioning, billingState exists but customer is undefined
        // despite TypeScript types indicating customer is always present
        if (!billingState || !billingState.customer) {
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
                addBanner({
                    message: `${creditCard.brand} credit card ending with ${creditCard.last4} is expired`,
                    type: AlertBannerTypes.Warning,
                    category: BannerCategories.PAYMENT_ENABLED,
                    instanceId: 'payment-method-expired',
                    CTA: {
                        type: 'internal',
                        to: BILLING_PAYMENT_CARD_PATH,
                        text: 'Change Payment Method',
                    },
                })

                return false
            }

            return true
        }

        if (shopifyBilling) {
            if (shopifyBilling.subscription_id === null) {
                addBanner({
                    message: 'Payment with Shopify is inactive',
                    type: AlertBannerTypes.Warning,
                    category: BannerCategories.PAYMENT_ENABLED,
                    instanceId: 'payment-method-expired-shopify-billing',
                    CTA: {
                        type: 'internal',
                        to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                        text: 'Activate Billing with Shopify',
                        opensInNewTab: true,
                    },
                })
                return false
            }

            return true
        }

        if (achDebit || achCredit) {
            return true
        }

        addBanner({
            message: 'No payment method registered on your account',
            type: AlertBannerTypes.Warning,
            category: BannerCategories.PAYMENT_ENABLED,
            instanceId: 'no-payment-method',
            CTA: {
                type: 'internal',
                to: BILLING_PAYMENT_CARD_PATH,
                text: 'Add a payment method',
            },
        })

        return false
    }, [billingState, addBanner])
}
