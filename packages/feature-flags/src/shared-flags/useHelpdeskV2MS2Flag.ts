import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'
import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2MS2Flag(): boolean {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    const hasUIVisionMilestone2 = useFlag(
        FeatureFlagKey.UIVisionMilestone2,
        false,
    )

    return hasUIVisionBeta && hasUIVisionMilestone2
}
