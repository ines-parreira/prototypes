import { useMemo } from 'react'

import type { OnboardingData } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import type { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

import { useGetOnboardings } from './useGetOnboardings'

type OnboardingDataWithoutId = Omit<OnboardingData, 'id'>

export const defaultOnboardingData = (
    scopes: AiAgentScopes[],
): OnboardingDataWithoutId => ({
    scopes,
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.08,
    shopName: '',
    shopType: 'shopify',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
    handoverMethod: 'email',
    handoverEmail: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
})

export const useGetOnboardingData = (shopName?: string) => {
    const { data: onboardingList, isLoading, isFetching } = useGetOnboardings()
    const scopes = useAiAgentScopesForAutomationPlan(shopName)

    const data = useMemo(():
        | OnboardingData
        | OnboardingDataWithoutId
        | undefined => {
        if (!onboardingList) return undefined

        const selectedShopData = onboardingList.find(
            (item: OnboardingData) => item.shopName === shopName,
        )
        if (shopName && selectedShopData) {
            return selectedShopData
        }
        const onGoingOnboarding = onboardingList.find(
            (item: OnboardingData) => !item.shopName,
        )
        if (onGoingOnboarding) {
            return onGoingOnboarding
        }
        return defaultOnboardingData(scopes)
    }, [shopName, onboardingList, scopes])

    return { data, isLoading: isLoading || isFetching }
}
