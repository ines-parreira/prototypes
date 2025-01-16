import React from 'react'

import {useOnboarding} from 'pages/aiAgent/Onboarding/hooks/useOnboarding'
import {
    ConvAiOnboardingLayout,
    OnboardingHeader,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {OnboardingContextProvider} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

export const Onboarding: React.FC<{
    shopName: string
}> = ({shopName}) => {
    const {render} = useOnboarding({
        shopName: shopName,
    })
    return (
        <OnboardingContextProvider>
            <ConvAiOnboardingLayout>
                <OnboardingHeader
                    onClose={function (): void {
                        throw new Error('Function not implemented.')
                    }}
                />
                {render()}
            </ConvAiOnboardingLayout>
        </OnboardingContextProvider>
    )
}
