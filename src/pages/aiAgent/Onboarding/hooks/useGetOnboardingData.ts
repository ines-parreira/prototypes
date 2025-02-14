import {useQuery} from '@tanstack/react-query'

import {getOnboardingData} from 'models/aiAgent/resources/configuration'
import {OnboardingData} from 'models/aiAgent/types'

import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

type OnboardingDataWithoutId = Omit<OnboardingData, 'id'>

export const defaultOnboardingData: OnboardingDataWithoutId = {
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT],
    shopName: '',
    shopType: 'shopify',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
    currentStepName: WizardStepEnum.SKILLSET,
}

export const useGetOnboardingData = (shopName?: string) => {
    return useQuery({
        queryKey: ['onboardingData', shopName],
        queryFn: async () => {
            const data = await getOnboardingData()
            const selectedShopData = data.find(
                (item: OnboardingData) => item.shopName === shopName
            )
            if (shopName && selectedShopData) {
                return selectedShopData
            }
            const onGoingOnboarding = data.find(
                (item: OnboardingData) => !item.shopName
            )
            if (onGoingOnboarding) {
                return onGoingOnboarding
            }
            return defaultOnboardingData
        },
        staleTime: Infinity,
    })
}
