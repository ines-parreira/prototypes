import {useMutation, useQueryClient} from '@tanstack/react-query'

import {updateOnboardingData} from 'models/aiAgent/resources/configuration'
import {OnboardingData} from 'models/aiAgent/types'

export const useUpdateOnboarding = () => {
    const queryClient = useQueryClient()

    return useMutation(
        ({id, data}: {id: string | number; data: Partial<OnboardingData>}) =>
            updateOnboardingData(id, data),
        {
            onSuccess: () => {
                // Invalidate the onboardingData query to trigger a refetch
                void queryClient.invalidateQueries(['onboardingData'])
            },
        }
    )
}
