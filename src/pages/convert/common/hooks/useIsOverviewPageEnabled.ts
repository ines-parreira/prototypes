import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

export const useIsOverviewPageEnabled = () => {
    return useFlag(FeatureFlagKey.ConvertOverviewPage, false)
}
