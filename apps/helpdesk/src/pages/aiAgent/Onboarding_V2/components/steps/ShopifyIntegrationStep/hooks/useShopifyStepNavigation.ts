import { useCallback, useState } from 'react'

import type { History } from 'history'

import type { OnboardingData } from 'models/aiAgent/types'
import type { StoreIntegration } from 'models/integration/types'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import type {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'

type OnboardingDataWithoutId = Omit<OnboardingData, 'id'>

interface ValidStep {
    step: WizardStepEnum
}

interface UseShopifyStepNavigationParams {
    currentStep: number
    validSteps: ValidStep[]
    goToStep: (step: WizardStepEnum) => void
    selectedShop: string | undefined
    selectedShopType: string | undefined
    setIsStoreSelected: (isStoreSelected: boolean) => void
    history: History
    availableStores: StoreIntegration[]
    onboardingData: OnboardingData | OnboardingDataWithoutId | undefined
    isDirty: boolean
    scopes: AiAgentScopes[]
    accountDomain: string
}

interface UseShopifyStepNavigationReturn {
    onNextClick: () => Promise<void>
    onBackClick: () => void
    shopError: string | null
    isLoading: boolean
}

export function useShopifyStepNavigation({
    currentStep,
    validSteps,
    goToStep,
    selectedShop,
    selectedShopType,
    setIsStoreSelected,
    history,
    availableStores,
    onboardingData,
    isDirty,
    scopes,
    accountDomain,
}: UseShopifyStepNavigationParams): UseShopifyStepNavigationReturn {
    const [shopError, setShopError] = useState<string | null>(null)

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const {
        mutate: doCreateOnboardingMutation,
        isLoading: isCreatingOnboarding,
    } = useCreateOnboarding()

    const goToNextStep = useCallback(() => {
        const nextStep = validSteps[currentStep]?.step
        const newPath = `/app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${nextStep}`
        setIsStoreSelected(true)
        history.push(newPath)
    }, [
        validSteps,
        currentStep,
        selectedShopType,
        selectedShop,
        setIsStoreSelected,
        history,
    ])

    const onBackClick = useCallback(() => {
        const previousStep = validSteps[currentStep - 2]?.step
        goToStep(previousStep)
    }, [validSteps, currentStep, goToStep])

    const onNextClick = useCallback(async () => {
        if (!availableStores.length) {
            setShopError(
                'No Shopify store connected. Please connect a store before proceeding.',
            )
            return
        }

        const nextStep = validSteps[currentStep]?.step
        const updatedData: Partial<OnboardingData> = {
            scopes,
            gorgiasDomain: accountDomain,
            shopName: selectedShop,
            currentStepName: nextStep,
        }

        if (!isDirty && !!onboardingData?.shopName) {
            goToNextStep()
            return
        }

        if (onboardingData && 'id' in onboardingData) {
            doUpdateOnboardingMutation(
                {
                    ...onboardingData,
                    id: onboardingData.id as string,
                    data: updatedData,
                },
                {
                    onSuccess: () => {
                        goToNextStep()
                    },
                },
            )
        } else {
            doCreateOnboardingMutation(updatedData, {
                onSuccess: () => {
                    goToNextStep()
                },
            })
        }
    }, [
        availableStores,
        validSteps,
        currentStep,
        scopes,
        accountDomain,
        selectedShop,
        isDirty,
        onboardingData,
        goToNextStep,
        doUpdateOnboardingMutation,
        doCreateOnboardingMutation,
    ])

    return {
        onNextClick,
        onBackClick,
        shopError,
        isLoading: isUpdatingOnboarding || isCreatingOnboarding,
    }
}
