import {useCreditCard} from 'models/billing/queries'

export const useHasCreditCard = () => {
    const {data: {data: card} = {}, ...info} = useCreditCard()

    const hasCreditCard = !!card?.brand

    return {
        data: hasCreditCard,
        ...info,
    }
}
