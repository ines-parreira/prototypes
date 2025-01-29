import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'

const useCanAddContactFormFlag = () => {
    return useFlag(FeatureFlagKey.ConvertContactForm)
}

export default useCanAddContactFormFlag
