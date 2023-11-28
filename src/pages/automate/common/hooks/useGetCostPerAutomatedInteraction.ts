import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {Price, ProductType} from 'models/billing/types'
import {getBillingState} from 'state/billing/selectors'
import {getCurrentSubscription} from 'state/currentAccount/selectors'

const FIXED_COST_PER_AUTOMATED_INTERACTION = 0.85

export const useGetCostPerAutomatedInteraction = () => {
    const billing = useAppSelector(getBillingState)
    const currentSubscription = useAppSelector(
        getCurrentSubscription
    ) as Immutable.Map<
        string,
        {
            products: Immutable.List<Record<string, string>>
        }
    >

    return useMemo(() => {
        const automationPrices =
            billing.products
                .find((product) => product.type === ProductType.Automation)
                ?.prices.reduce<Record<string, Price>>(
                    (acc, price) => ({...acc, [price.price_id]: price}),
                    {}
                ) ?? {}

        if (!automationPrices || currentSubscription.isEmpty()) return 0

        const subscriptionProducts = Object.values(
            (currentSubscription.get('products').products?.toJS() as Record<
                string,
                number
            >) ?? []
        )

        const selectedProduct = subscriptionProducts
            .map((priceId) => automationPrices[priceId])
            .find(Boolean)

        if (selectedProduct?.num_quota_tickets) {
            return selectedProduct.amount / selectedProduct.num_quota_tickets
        }

        return FIXED_COST_PER_AUTOMATED_INTERACTION
    }, [billing, currentSubscription])
}
