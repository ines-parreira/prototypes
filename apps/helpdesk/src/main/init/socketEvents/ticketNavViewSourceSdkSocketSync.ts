import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { syncViewRealtimeEvent } from '@repo/views'
import type { ViewRealtimeEvent } from '@repo/views'

export function syncTicketNavViewSourceSdkEvent(event: ViewRealtimeEvent) {
    void fetchFlag(FeatureFlagKey.TicketNavViewSourceSdk, false)
        .then(({ flag }) => {
            if (flag) {
                syncViewRealtimeEvent(event)
            }
        })
        .catch(() => undefined)
}
