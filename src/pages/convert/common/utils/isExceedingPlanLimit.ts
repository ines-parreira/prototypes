import moment from 'moment-timezone'

import {
    BundleOnboardingStatus,
    UsageStatus,
} from 'pages/convert/common/hooks/useGetConvertStatus'
import { Components } from 'rest_api/revenue_addon_api/client.generated'

export const isExceedingPlanLimit = (
    status: Components.Schemas.SubscriptionUsageAndBundleStatusSchema,
): boolean => {
    const cycleStart = status.cycle_start && moment.utc(status.cycle_start)
    const cycleEnd = status.cycle_end && moment.utc(status.cycle_end)
    const lastWarning =
        status.last_warning_100_at && moment.utc(status.last_warning_100_at)
    const estimatedReachDate =
        status.estimated_reach_date && moment.utc(status.estimated_reach_date)

    return Boolean(
        status.usage_status === UsageStatus.OK &&
            status.bundle_status === BundleOnboardingStatus.INSTALLED &&
            lastWarning &&
            estimatedReachDate &&
            cycleStart &&
            cycleEnd &&
            cycleStart <= lastWarning &&
            lastWarning <= cycleEnd &&
            cycleStart <= estimatedReachDate &&
            estimatedReachDate <= cycleEnd,
    )
}
