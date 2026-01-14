import { useMemo } from 'react'

import type { Plan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import {
    getPlanPrice,
    getPlanPriceFormatted,
    getProductInfo,
} from 'models/billing/utils'
import type { ProductToPlan } from 'state/billing/types'

import SummaryBody from '../UI/SummaryBody'
import SummaryHeader from '../UI/SummaryHeader'
import type { SummaryItemData } from '../UI/types'

import css from './CancellationSummary.less'

type CancellationSummaryProps = {
    subscriptionProducts: ProductToPlan
    cancellingProducts: ProductType[]
    periodEnd: string
    cancelledProducts?: ProductType[]
}

const CancellationSummary = ({
    subscriptionProducts,
    cancellingProducts,
    periodEnd,
    cancelledProducts = [],
}: CancellationSummaryProps) => {
    const cadence = subscriptionProducts[ProductType.Helpdesk].cadence

    const [summaryItems, summaryTotal] = useMemo(() => {
        let total = 0

        const items: SummaryItemData[] = Object.keys(subscriptionProducts)
            .filter((key) => !!subscriptionProducts[key as ProductType])
            .map((key) => {
                const productType = key as ProductType
                const toBeRemoved =
                    cancellingProducts.includes(productType) ||
                    cancelledProducts.includes(productType)
                const plan = subscriptionProducts[productType] as Plan
                const productInfo = getProductInfo(productType, plan)

                if (!toBeRemoved) {
                    total += getPlanPrice(plan)
                }

                return {
                    title: productInfo.title,
                    label:
                        productType === ProductType.Helpdesk
                            ? `${plan.name} - `
                            : null,
                    cadence: plan.cadence,
                    quotaAmount: plan.num_quota_tickets || 0,
                    counter: productInfo.counter,
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
    }, [subscriptionProducts, cancellingProducts, cancelledProducts])

    return (
        <div className={css.container}>
            <SummaryHeader periodEnd={periodEnd} />
            <SummaryBody
                items={summaryItems}
                total={summaryTotal}
                cadence={cadence}
            />
        </div>
    )
}

export default CancellationSummary
