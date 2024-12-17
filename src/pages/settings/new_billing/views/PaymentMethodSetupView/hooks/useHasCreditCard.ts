import {useBillingStateWithSideEffects} from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'

export const useHasCreditCard = (
    overrides?: Parameters<typeof useBillingStateWithSideEffects>['0']
) => {
    const {data, ...result} = useBillingStateWithSideEffects(overrides)

    const hasCreditCard = !!data?.customer.credit_card

    return {
        data: hasCreditCard,
        ...result,
    }
}
