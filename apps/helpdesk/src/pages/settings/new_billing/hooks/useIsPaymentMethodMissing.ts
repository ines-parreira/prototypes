import { useBillingState } from '@repo/billing'

import { useAppSelector } from 'hooks/useAppSelector'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify as getShouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'

export function useIsPaymentMethodMissing({
    isActiveSubscription,
}: {
    isActiveSubscription: boolean
}): boolean {
    const billingState = useBillingState()
    const customer = billingState.data?.customer
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)
    const shopifyBillingStatus = useAppSelector(getShopifyBillingStatus)

    const hasStripePaymentMethod =
        !!customer?.credit_card ||
        !!customer?.ach_debit_bank_account ||
        !!customer?.ach_credit_bank_account

    return (
        isActiveSubscription &&
        (shouldPayWithShopify
            ? shopifyBillingStatus !== ShopifyBillingStatus.Active
            : !hasStripePaymentMethod)
    )
}
