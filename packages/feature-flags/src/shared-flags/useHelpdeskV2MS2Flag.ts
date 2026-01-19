import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

export function useHelpdeskV2MS2Flag() {
    const hasUIVisionBetaBaseline = useFlag(
        FeatureFlagKey.UIVisionBetaBaseline,
        false,
    )
    const hasUIVisionMilestone2 = useFlag(
        FeatureFlagKey.UIVisionMilestone2,
        false,
    )

    return hasUIVisionBetaBaseline && hasUIVisionMilestone2
}
