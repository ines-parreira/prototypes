import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

const useCanAddContactFormFlag = () => {
    return useFlag(FeatureFlagKey.ConvertContactForm)
}

export default useCanAddContactFormFlag
