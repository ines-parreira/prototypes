import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'

export function useHelpdeskV2MS4Dot5Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionMilestone4Dot5 = useFlag(
        FeatureFlagKey.UIVisionMilestone4Dot5,
    )
    const isMobileResolution = useIsMobileResolution()

    return hasUIVisionBeta && hasUIVisionMilestone4Dot5 && !isMobileResolution
}
