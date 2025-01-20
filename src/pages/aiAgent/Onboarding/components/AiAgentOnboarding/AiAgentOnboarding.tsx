import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {Redirect, useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {useOnboarding} from 'pages/aiAgent/Onboarding/hooks/useOnboarding'
import {
    ConvAiOnboardingLayout,
    OnboardingHeader,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {OnboardingContextProvider} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

const Wrapped: React.FC = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const {render} = useOnboarding({
        shopName: shopName,
    })

    const {routes} = useAiAgentNavigation({shopName})

    const isConvAiOnboardingEnabled =
        useFlags()[FeatureFlagKey.ConvAiOnboarding]

    if (isConvAiOnboardingEnabled === false) {
        return <Redirect to={routes.main} />
    }

    return (
        <ConvAiOnboardingLayout>
            <OnboardingHeader
                onClose={function (): void {
                    throw new Error('Function not implemented.')
                }}
            />
            {render()}
        </ConvAiOnboardingLayout>
    )
}

export const AiAgentOnboarding = () => {
    return (
        <OnboardingContextProvider>
            <Wrapped />
        </OnboardingContextProvider>
    )
}
