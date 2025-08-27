import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentConvertPlan } from 'state/billing/selectors'

export function useIsConvertSubscriber(): boolean {
    const isRevenueBetaTester = useFlag(FeatureFlagKey.RevenueBetaTesters)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)

    return Boolean(isRevenueBetaTester) || Boolean(currentConvertPlan)
}
