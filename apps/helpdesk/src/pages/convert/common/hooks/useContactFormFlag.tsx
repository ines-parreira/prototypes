import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

const useCanAddContactFormFlag = () => {
    return useFlag(FeatureFlagKey.ConvertContactForm)
}

export default useCanAddContactFormFlag
