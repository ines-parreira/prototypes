import {useCreditCardWithSideEffects} from 'pages/settings/new_billing/hooks/useCreditCardWithSideEffects'

export const useHasCreditCard = () => {
    const {data: {data: card} = {}, ...info} = useCreditCardWithSideEffects()

    const hasCreditCard = !!card?.brand

    return {
        data: hasCreditCard,
        ...info,
    }
}
