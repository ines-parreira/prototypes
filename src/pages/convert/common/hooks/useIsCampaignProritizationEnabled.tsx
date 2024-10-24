import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

const useIsCampaignProritizationEnabled = () => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertCampaignProritization]
}

export default useIsCampaignProritizationEnabled
