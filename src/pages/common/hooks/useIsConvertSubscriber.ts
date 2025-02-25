import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentConvertPlan } from 'state/billing/selectors'

export function useIsConvertSubscriber(): boolean {
    const flags = useFlags()
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)

    return (
        Boolean(flags[FeatureFlagKey.RevenueBetaTesters]) ||
        Boolean(currentConvertPlan)
    )
}
