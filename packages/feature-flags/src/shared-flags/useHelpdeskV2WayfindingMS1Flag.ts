import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'
import { useHelpdeskV2BaselineFlag } from './useHelpdeskV2BaselineFlag'

export function useHelpdeskV2WayfindingMS1Flag(): boolean {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionWayfindingMS1 = useFlag(
        FeatureFlagKey.UIVisionWayfindingMS1,
        false,
    )

    return hasUIVisionBeta && hasUIVisionWayfindingMS1
}
