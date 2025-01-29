import React, {useMemo} from 'react'

import {Plan, ProductType} from 'models/billing/types'
import {getPlanPrice, getPlanPriceFormatted} from 'models/billing/utils'

import {PRODUCT_INFO} from '../../../constants'
import SummaryBody from '../UI/SummaryBody'
import SummaryHeader from '../UI/SummaryHeader'
import {SummaryItemData} from '../UI/types'
import css from './CancellationSummary.less'
import {SubscriptionProducts} from './types'

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
    const cadence = subscriptionProducts[ProductType.Helpdesk].cadence

    const [summaryItems, summaryTotal] = useMemo(() => {
        let total = 0

        const items: SummaryItemData[] = Object.keys(subscriptionProducts)
            .filter((key) => !!subscriptionProducts[key as ProductType])
            .map((key) => {
                const productType = key as ProductType
                const toBeRemoved = cancellingProducts.includes(productType)
                const plan = subscriptionProducts[productType] as Plan

                if (!toBeRemoved) {
                    total += getPlanPrice(plan)
                }

                return {
                    title: PRODUCT_INFO[productType].title,
                    label:
                        productType === ProductType.Helpdesk
                            ? `${plan.name} - `
                            : null,
                    interval: plan.cadence,
                    quotaAmount: plan.num_quota_tickets || 0,
                    counter: PRODUCT_INFO[productType].counter,
                    amount: getPlanPriceFormatted(plan),
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
                interval={cadence}
            />
        </div>
    )
}

export default CancellationSummary
