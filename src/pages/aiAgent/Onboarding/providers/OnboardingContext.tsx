import React, {createContext, useContext, ReactNode} from 'react'

import {
    AiAgentScopes,
    OnboardingContextData,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding/types'

type OnboardingContextHandlers = {
    setOnboardingData?: (data: Partial<OnboardingContextData>) => void
}

const getDefaultOnboardingWizardData = (): OnboardingContextData => ({
    lastStep: WizardStepEnum.SKILLSET,
    scope: [AiAgentScopes.SUPPORT],
    shopName: '',
})

export const OnboardingContext = createContext<
    OnboardingContextData & OnboardingContextHandlers
>(getDefaultOnboardingWizardData())

export const useOnboardingContext = () => {
    const context = useContext(OnboardingContext)
    if (!context) {
        throw new Error(
            'useOnboardingContext must be used within an OnboardingContextProvider'
        )
    }
    return context
}

export const OnboardingContextProvider = ({
    children,
    initialData,
}: {
    children: ReactNode
    initialData?: OnboardingContextData
}) => {
    const [onboardingData, setOnboardingStateData] =
        React.useState<OnboardingContextData>(
            initialData ?? getDefaultOnboardingWizardData()
        )

    const setOnboardingData = (data: Partial<OnboardingContextData>) => {
        setOnboardingStateData((oldData) => ({...oldData, ...data}))
    }

    return (
        <OnboardingContext.Provider
            value={{...onboardingData, setOnboardingData}}
        >
            {children}
        </OnboardingContext.Provider>
    )
}
