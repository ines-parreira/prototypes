import { logEvent, SegmentEvent } from 'common/segment'
import { PlanId } from 'models/billing/types'

export const handleConvertProductRemoved = (
    planId: PlanId | undefined,
    domain: string | undefined,
) => {
    logEvent(SegmentEvent.ConvertBillingProductRemoved, {
        account: domain,
        from: planId,
    })
}
