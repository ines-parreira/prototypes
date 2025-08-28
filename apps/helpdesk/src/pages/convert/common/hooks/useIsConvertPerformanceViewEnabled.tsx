import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

export const useIsConvertPerformanceViewEnabled = (): boolean => {
    return !!useFlag(FeatureFlagKey.ConvertPerformanceView)
}
