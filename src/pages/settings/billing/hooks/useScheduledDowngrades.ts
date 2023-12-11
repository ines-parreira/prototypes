// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {fetchSubscription} from 'models/billing/resources'
import {Price, Product} from 'models/billing/types'
import {getPricesMap, getProducts} from 'state/billing/selectors'

interface ScheduledDowngrade {
    datetime: string
    from: Price
    product: Product
    to: Price | null
}

export default function useScheduledDowngrades() {
    const products = useAppSelector(getProducts)
    const pricesMap = useAppSelector(getPricesMap)

    const [state, doFetch] = useAsyncFn(async () => {
        const sub = await fetchSubscription()

        const downgrades: ScheduledDowngrade[] = (sub.downgrades || [])
            .filter((downgrade) => {
                const fromPrice = pricesMap[downgrade.current_price_id]
                return !!fromPrice
            })
            .map((downgrade) => {
                const fromPrice = pricesMap[downgrade.current_price_id]
                return {
                    datetime: sub.current_billing_cycle_end_datetime,
                    from: fromPrice,
                    product: products.find(
                        (product) => product.id === fromPrice.product_id
                    ) as Product,
                    to: downgrade.scheduled_price_id
                        ? pricesMap[downgrade.scheduled_price_id]
                        : null,
                }
            })

        return downgrades
    }, [pricesMap, products])

    useEffectOnce(() => {
        void doFetch()
    })

    return state
}
