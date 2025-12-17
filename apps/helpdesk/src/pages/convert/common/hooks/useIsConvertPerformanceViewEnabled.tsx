import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export const useIsConvertPerformanceViewEnabled = (): boolean => {
    return !!useFlag(FeatureFlagKey.ConvertPerformanceView)
}
