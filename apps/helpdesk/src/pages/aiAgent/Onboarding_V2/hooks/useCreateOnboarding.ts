import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import { createOnboardingData } from 'models/aiAgent/resources/configuration'
import type { OnboardingData } from 'models/aiAgent/types'

type APIErrorResponse = {
    message?: string
}

export const useCreateOnboarding = () => {
    const queryClient = useQueryClient()

    return useMutation<
        void,
        AxiosError<APIErrorResponse>,
        Partial<OnboardingData>
    >(
        async (newOnboarding) => {
            await createOnboardingData(newOnboarding)
        },
        {
            onSuccess: () => {
                // Invalidate the onboardingData query to trigger a refetch
                void queryClient.invalidateQueries(['onboardingData'])
            },
            onError: (err) => {
                // Extract error message dynamically from API response
                const errorMessage =
                    err.response?.data?.message ||
                    'An unexpected error occurred while creating onboarding. Please try again.'

                toast.error(errorMessage, { id: 'create-onboarding-error' })
            },
        },
    )
}
