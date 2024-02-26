import React, {useMemo} from 'react'
import {Price, ProductType} from 'models/billing/types'
import SummaryBody from '../UI/SummaryBody'
import SummaryHeader from '../UI/SummaryHeader'
import {SummaryItemData} from '../UI/types'
import {PRODUCT_INFO} from '../../../constants'
import {formatAmount} from '../../../utils/formatAmount'
import {SubscriptionProducts} from './types'
import css from './CancellationSummary.less'

type CancellationSummaryProps = {
    subscriptionProducts: SubscriptionProducts
    cancellingProducts: ProductType[]
    periodEnd: string
}

const CancellationSummary = ({
    subscriptionProducts,
    cancellingProducts,
    periodEnd,
}: CancellationSummaryProps) => {
    const interval = subscriptionProducts[ProductType.Helpdesk].interval

    const [summaryItems, summaryTotal] = useMemo(() => {
        let total = 0

        const items: SummaryItemData[] = Object.keys(subscriptionProducts)
            .filter((key) => !!subscriptionProducts[key as ProductType])
            .map((key) => {
                const productType = key as ProductType
                const toBeRemoved = cancellingProducts.includes(productType)
                const price = subscriptionProducts[productType] as Price

                if (!toBeRemoved) {
                    total += (price.amount | 0) / 100
                }

                return {
                    title: PRODUCT_INFO[productType].title,
                    label:
                        productType === ProductType.Helpdesk
                            ? `${price.name} - `
                            : null,
                    interval: price.interval,
                    quotaAmount: price.num_quota_tickets || 0,
                    counter: PRODUCT_INFO[productType].counter,
                    amount: formatAmount(price.amount / 100, price.currency),
                    strickenOut: toBeRemoved,
                }
            })
            .sort((a, b) => {
                if (a.strickenOut && !b.strickenOut) {
                    return 1 // Move stricken items to the end
                } else if (!a.strickenOut && b.strickenOut) {
                    return -1 // Keep non-stricken items first
                }
                return 0 // Maintain the existing order for non-stricken items
            })
        return [items, total] as const
    }, [subscriptionProducts, cancellingProducts])

    return (
        <div className={css.container}>
            <SummaryHeader periodEnd={periodEnd} />
            <SummaryBody
                items={summaryItems}
                total={summaryTotal}
                interval={interval}
            />
        </div>
    )
}

export default CancellationSummary
