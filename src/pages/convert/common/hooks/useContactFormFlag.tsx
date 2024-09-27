import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

const useCanAddContactFormFlag = () => {
    return useFlag(FeatureFlagKey.ConvertContactForm, false)
}

export default useCanAddContactFormFlag
