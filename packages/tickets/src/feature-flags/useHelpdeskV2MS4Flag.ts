import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'

export function useHelpdeskV2MS4Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionMilestone4 = useFlag(FeatureFlagKey.UIVisionMilestone4)
    const isMobileResolution = useIsMobileResolution()

    return hasUIVisionBeta && hasUIVisionMilestone4 && !isMobileResolution
}
