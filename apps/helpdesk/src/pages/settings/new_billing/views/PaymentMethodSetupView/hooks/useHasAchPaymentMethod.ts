import { useBillingStateWithSideEffects } from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'

export const useHasAchPaymentMethod = (
    overrides?: Parameters<typeof useBillingStateWithSideEffects>['0'],
) => {
    const { data: billingState, ...result } =
        useBillingStateWithSideEffects(overrides)

    const hasAchPaymentMethod =
        !!billingState?.customer?.ach_debit_bank_account ||
        !!billingState?.customer?.ach_credit_bank_account

    return {
        data: hasAchPaymentMethod,
        ...result,
    }
}
