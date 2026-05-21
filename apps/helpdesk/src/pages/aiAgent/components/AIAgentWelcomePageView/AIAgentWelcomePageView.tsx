import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Loader } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { AIAgentWelcomePageViewV3 } from 'pages/aiAgent/components/AIAgentWelcomePageViewV3/AIAgentWelcomePageViewV3'

import { AIAgentWelcomePageViewV2 } from './AIAgentWelcomePageViewV2'

export type DynamicItem = {
    checked: boolean
    link?: string
}

export type AiAgentWelcomePageProps = {
    accountDomain: string
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

export const AIAgentWelcomePageView = (props: AiAgentWelcomePageProps) => {
    const { value: isV3FlagOn, isLoading: isFlagLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )

    if (isFlagLoading) {
        return (
            <Box
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
            >
                <Loader size="sm" aria-label="Loading" />
            </Box>
        )
    }

    if (isV3FlagOn) {
        return <AIAgentWelcomePageViewV3 {...props} />
    }

    return <AIAgentWelcomePageViewV2 {...props} />
}
