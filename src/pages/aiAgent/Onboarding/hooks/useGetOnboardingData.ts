import { useMemo } from 'react'

import { OnboardingData } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

import { useGetOnboardings } from './useGetOnboardings'

type OnboardingDataWithoutId = Omit<OnboardingData, 'id'>

export const defaultOnboardingData: OnboardingDataWithoutId = {
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.08,
    scopes: [AiAgentScopes.SUPPORT],
    shopName: '',
    shopType: 'shopify',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
    currentStepName: WizardStepEnum.SKILLSET,
}

export const useGetOnboardingData = (shopName?: string) => {
    const { data: onboardingList, isLoading } = useGetOnboardings()

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
        return defaultOnboardingData
    }, [shopName, onboardingList])

    return { data, isLoading }
}
