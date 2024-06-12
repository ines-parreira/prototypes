import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import useAsyncFn from 'hooks/useAsyncFn'
import {fetchSubscription} from 'models/billing/resources'
import {Price, Product} from 'models/billing/types'
import {
    getAvailablePlansMap,
    getAvailablePlansByProduct,
} from 'state/billing/selectors'

interface ScheduledDowngrade {
    datetime: string
    from: Price
    product: Product
    to: Price | null
}

export default function useScheduledDowngrades() {
    const availablePlansByProduct = useAppSelector(getAvailablePlansByProduct)
    const availablePlansMap = useAppSelector(getAvailablePlansMap)

    const [state, doFetch] = useAsyncFn(async () => {
        const sub = await fetchSubscription()

        const downgrades: ScheduledDowngrade[] = (sub.downgrades || [])
            .filter((downgrade) => {
                const fromPrice = availablePlansMap[downgrade.current_price_id]
                return !!fromPrice
            })
            .map((downgrade) => {
                const fromPrice = availablePlansMap[downgrade.current_price_id]
                return {
                    datetime: sub.current_billing_cycle_end_datetime,
                    from: fromPrice,
                    product: availablePlansByProduct.find(
                        (product) => product.id === fromPrice.product_id
                    ) as Product,
                    to: downgrade.scheduled_price_id
                        ? availablePlansMap[downgrade.scheduled_price_id]
                        : null,
                }
            })

        return downgrades
    }, [availablePlansMap, availablePlansByProduct])

    useEffectOnce(() => {
        void doFetch()
    })

    return state
}
