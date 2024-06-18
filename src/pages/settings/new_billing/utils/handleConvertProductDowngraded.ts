import {logEvent, SegmentEvent} from 'common/segment'
import {ConvertPlan} from 'models/billing/types'

export const handleConvertProductDowngraded = (
    oldProduct: ConvertPlan | undefined,
    newProduct: ConvertPlan | undefined,
    domain: string | undefined
) => {
    const oldTier = oldProduct?.tier || 0
    const newTier = newProduct?.tier || 0

    if (oldTier > newTier) {
        logEvent(SegmentEvent.ConvertBillingProductScheduledDowngrade, {
            account: domain,
            from: oldProduct?.internal_id,
            to: newProduct?.internal_id,
        })
    }
}
