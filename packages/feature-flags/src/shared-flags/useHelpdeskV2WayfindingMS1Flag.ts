import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

export function useHelpdeskV2WayfindingMS1Flag() {
    const hasUIVisionBetaBaseline = useFlag(
        FeatureFlagKey.UIVisionBetaBaseline,
        false,
    )
    const hasUIVisionWayfindingMS1 = useFlag(
        FeatureFlagKey.UIVisionWayfindingMS1,
        false,
    )

    return hasUIVisionBetaBaseline && hasUIVisionWayfindingMS1
}
