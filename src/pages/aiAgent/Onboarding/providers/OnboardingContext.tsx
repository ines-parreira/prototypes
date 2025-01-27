import React, {createContext, useContext, ReactNode} from 'react'

import {
    useGetOnboardingSettings,
    GetOnboardingSetting,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingSettings'
import {
    AiAgentScopes,
    OnboardingContextData,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding/types'

type OnboardingContextHandlers = {
    getOnboardingData: () => GetOnboardingSetting
    setOnboardingData: (data: Partial<OnboardingContextData>) => void
}
// Prevent to have undefined handlers
const getDefaultHandlers = (): OnboardingContextHandlers => ({
    getOnboardingData: () => {
        throw new Error('Function not implemented.')
    },
    setOnboardingData: () => {
        throw new Error('Function not implemented.')
    },
})

const getDefaultOnboardingWizardData = (): OnboardingContextData => ({
    lastStep: WizardStepEnum.SKILLSET,
    scope: [AiAgentScopes.SUPPORT],
    shopName: '',
})

export const OnboardingContext = createContext<
    OnboardingContextData & OnboardingContextHandlers
>({
    ...getDefaultOnboardingWizardData(),
    ...getDefaultHandlers(),
})

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
            value={{
                ...onboardingData,
                setOnboardingData,
                getOnboardingData: useGetOnboardingSettings,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    )
}
