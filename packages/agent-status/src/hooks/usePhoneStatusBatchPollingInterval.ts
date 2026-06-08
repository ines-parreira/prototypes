import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Duration } from '@gorgias/toolkit'

const DEFAULT_POLLING_INTERVAL_SECONDS = 30

export const usePhoneStatusBatchPollingInterval = (): number => {
    const refetchIntervalSeconds = useFlag<number>(
        FeatureFlagKey.PhoneStatusBatchPollingInterval,
        DEFAULT_POLLING_INTERVAL_SECONDS,
    )

    return Duration.seconds(refetchIntervalSeconds)
}
