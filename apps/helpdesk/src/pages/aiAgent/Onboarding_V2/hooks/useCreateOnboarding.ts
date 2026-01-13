import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import { createOnboardingData } from 'models/aiAgent/resources/configuration'
import type { OnboardingData } from 'models/aiAgent/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type APIErrorResponse = {
    message?: string
}

export const useCreateOnboarding = () => {
    const dispatch = useAppDispatch()
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

                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMessage,
                        id: 'create-onboarding-error',
                    }),
                )
            },
        },
    )
}
