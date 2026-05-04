import { useIsMobileResolution } from '@repo/hooks'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'
import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2MS4Dash6Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const { value: hasUIVisionMilestone4Dash6 } = useFlagWithLoading(
        FeatureFlagKey.UIVisionMilestone4Dash6,
        false,
    )
    const isMobileResolution = useIsMobileResolution()

    return hasUIVisionBeta && hasUIVisionMilestone4Dash6 && !isMobileResolution
}
