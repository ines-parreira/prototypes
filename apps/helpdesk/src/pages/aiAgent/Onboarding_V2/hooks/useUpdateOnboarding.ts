import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import { updateOnboardingData } from 'models/aiAgent/resources/configuration'
import type { OnboardingData } from 'models/aiAgent/types'

type UpdateOnboardingParams = {
    id: string | number
    data: Partial<OnboardingData>
}

type APIErrorResponse = {
    message?: string
}

export const useUpdateOnboarding = () => {
    const queryClient = useQueryClient()

    return useMutation<
        void,
        AxiosError<APIErrorResponse>,
        UpdateOnboardingParams
    >(
        async ({ id, data }) => {
            await updateOnboardingData(id, data)
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
                    'An unexpected error occurred. Please try again.'

                toast.error(errorMessage, { id: 'update-onboarding-error' })
            },
        },
    )
}
