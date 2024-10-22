import {useCreditCardWithSideEffects} from 'pages/settings/new_billing/hooks/useCreditCardWithSideEffects'

export const useHasCreditCard = (
    overrides?: Parameters<typeof useCreditCardWithSideEffects>['0']
) => {
    const {data: {data: card} = {}, ...info} =
        useCreditCardWithSideEffects(overrides)

    const hasCreditCard = !!card?.brand

    return {
        data: hasCreditCard,
        ...info,
    }
}
