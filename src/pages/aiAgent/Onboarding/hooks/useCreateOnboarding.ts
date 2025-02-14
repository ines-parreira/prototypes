import {useMutation, useQueryClient} from '@tanstack/react-query'

import {createOnboardingData} from 'models/aiAgent/resources/configuration'
import {OnboardingData} from 'models/aiAgent/types'

export const useCreateOnboarding = () => {
    const queryClient = useQueryClient()

    return useMutation(
        (newOnboarding: Partial<OnboardingData>) =>
            createOnboardingData(newOnboarding),
        {
            onSuccess: () => {
                // Invalidate queries and properly handle the promise
                void queryClient.invalidateQueries(['onboardingData'])
            },
        }
    )
}
