import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentConvertProduct} from 'state/billing/selectors'

export function useIsConvertSubscriber(): boolean {
    const flags = useFlags()
    const currentConvertPlan = useAppSelector(getCurrentConvertProduct)

    return (
        Boolean(flags[FeatureFlagKey.RevenueBetaTesters]) ||
        Boolean(currentConvertPlan)
    )
}
