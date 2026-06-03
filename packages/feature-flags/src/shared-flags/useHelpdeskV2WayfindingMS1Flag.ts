import { useIsMobileResolution } from '@repo/hooks'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'
import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2WayfindingMS1Flag(): boolean {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const isMobileResolution = useIsMobileResolution()
    const { value: wayfindingMobileEnabled } = useFlagWithLoading(
        FeatureFlagKey.WayfindingMobileResolution,
        false,
    )

    return hasUIVisionBeta && (!isMobileResolution || wayfindingMobileEnabled)
}
