import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

const DEFAULT_POLLING_INTERVAL_SECONDS = 30

export const usePhoneStatusBatchPollingInterval = (): number => {
    const refetchIntervalSeconds = useFlag<number>(
        FeatureFlagKey.PhoneStatusBatchPollingInterval,
        DEFAULT_POLLING_INTERVAL_SECONDS,
    )

    return refetchIntervalSeconds * 1000
}
