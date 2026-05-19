import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useCurrentUserRole } from '@repo/users'

import { Banner } from '@gorgias/axiom'

import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'

export const SetupModeBanner = () => {
    const { isAdmin } = useCurrentUserRole()

    const { value: isV3FlagOn } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const isAiAgentAlreadyLive = storeConfiguration
        ? isAiAgentEnabledForStore(storeConfiguration)
        : false

    const isInSetupMode =
        isV3FlagOn && isAdmin && !isStoreConfigLoading && !isAiAgentAlreadyLive

    if (!isInSetupMode) {
        return null
    }

    return (
        <Banner
            intent="info"
            icon="info"
            description="You're in setup mode. Train and test AI Agent freely before you go live."
            isClosable={false}
        />
    )
}
