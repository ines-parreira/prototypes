import {useEffect, useState} from 'react'

import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'

export type GetOnboardingSetting = {
    isLoading: boolean
    data?: {
        persuasionLevel: PersuasionLevel
        discountStrategy: DiscountStrategy
        maxDiscountPercentage: number
    }
}
export const useGetOnboardingSettings = (): GetOnboardingSetting => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return {
            isLoading: true,
        }
    }

    return {
        isLoading: false,
        data: {
            persuasionLevel: PersuasionLevel.Moderate,
            discountStrategy: DiscountStrategy.Balanced,
            maxDiscountPercentage: 8,
        },
    }
}
