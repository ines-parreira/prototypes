import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import { updateOnboardingData } from 'models/aiAgent/resources/configuration'
import type { OnboardingData } from 'models/aiAgent/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UpdateOnboardingParams = {
    id: string | number
    data: Partial<OnboardingData>
}

type APIErrorResponse = {
    message?: string
}

export const useUpdateOnboarding = () => {
    const dispatch = useAppDispatch()
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

                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMessage,
                        id: 'update-onboarding-error',
                    }),
                )
            },
        },
    )
}
