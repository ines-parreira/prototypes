import {useQuery, useQueryClient} from '@tanstack/react-query'

import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'

// Define the data type returned by the API
export type OnboardingData = {
    persuasionLevel: PersuasionLevel
    discountStrategy: DiscountStrategy
    maxDiscountPercentage: number
    scope: AiAgentScopes[]
    shop?: string
    emailChannelEnabled?: boolean
    emailIntegrationIds?: number[]
    chatChannelEnabled?: boolean
    chatIntegrationIds?: number[]
    helpCenterId?: string
}

// Fetch function (simulate an API request)
const fetchOnboardingData = async (): Promise<OnboardingData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                persuasionLevel: PersuasionLevel.Moderate,
                discountStrategy: DiscountStrategy.Balanced,
                maxDiscountPercentage: 8,
                scope: [AiAgentScopes.SUPPORT],
            })
        }, 2000)
    })
}

// React Query Hook
export const useGetOnboardingData = () => {
    return useQuery({
        queryKey: ['onboardingData'],
        queryFn: fetchOnboardingData,
        staleTime: Infinity,
    })
}

// Helper function to update the cache
export const useUpdateOnboardingCache = () => {
    const queryClient = useQueryClient()

    return <K extends keyof OnboardingData>(
        field: K,
        value: OnboardingData[K]
    ) => {
        queryClient.setQueryData<OnboardingData | undefined>(
            ['onboardingData'],
            (oldData) => {
                if (!oldData) return {} as OnboardingData

                return {
                    ...oldData,
                    [field]: value,
                }
            }
        )
    }
}
