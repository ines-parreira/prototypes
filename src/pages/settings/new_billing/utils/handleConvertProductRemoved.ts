import { logEvent, SegmentEvent } from 'common/segment'

export const handleConvertProductRemoved = (
    planInternalId: string | undefined,
    domain: string | undefined,
) => {
    logEvent(SegmentEvent.ConvertBillingProductRemoved, {
        account: domain,
        from: planInternalId,
    })
}
