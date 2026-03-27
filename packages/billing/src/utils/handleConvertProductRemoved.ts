import { logEvent, SegmentEvent } from '@repo/logging'

import type { PlanId } from '../types'

export const handleConvertProductRemoved = (
    planId: PlanId | undefined,
    domain: string | undefined,
) => {
    logEvent(SegmentEvent.ConvertBillingProductRemoved, {
        account: domain,
        from: planId,
    })
}
