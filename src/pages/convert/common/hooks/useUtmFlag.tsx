import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

const useCanAddUtm = (isConvertSubscriber: boolean) => {
    return (
        useFlag(FeatureFlagKey.ConvertUtmConfigurationTab, false) &&
        isConvertSubscriber
    )
}

export default useCanAddUtm
