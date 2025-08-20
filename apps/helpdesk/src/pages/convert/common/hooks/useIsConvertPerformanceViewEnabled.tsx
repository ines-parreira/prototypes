import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

export const useIsConvertPerformanceViewEnabled = (): boolean => {
    return !!useFlag(FeatureFlagKey.ConvertPerformanceView)
}
