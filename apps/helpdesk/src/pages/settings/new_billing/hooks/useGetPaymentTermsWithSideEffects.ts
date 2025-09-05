import { useBillingStateWithSideEffects } from './useBillingStateWithSideEffects'

export const useGetPaymentTermsWithSideEffects = (
    overrides?: Parameters<typeof useBillingStateWithSideEffects>['0'],
) => {
    const { data: billingState, ...result } =
        useBillingStateWithSideEffects(overrides)

    const paymentTermInDays = billingState?.customer?.payment_term_days

    return {
        data: paymentTermInDays,
        ...result,
    }
}
