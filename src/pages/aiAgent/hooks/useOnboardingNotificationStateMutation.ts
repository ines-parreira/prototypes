import {useQueryClient} from '@tanstack/react-query'

import {useCallback} from 'react'

import {
    onboardingNotificationStateKeys,
    useCreateOnboardingNotificationState,
    useUpsertOnboardingNotificationState,
} from 'models/aiAgent/queries'
import {
    CreateOnboardingNotificationStatePayload,
    OnboardingNotificationState,
    UpsertOnboardingNotificationStatePayload,
} from 'models/aiAgent/types'

type Params = {
    accountDomain: string
    shopName: string
}

export const useOnboardingNotificationStateMutation = ({
    accountDomain,
    shopName,
}: Params) => {
    const queryClient = useQueryClient()

    const {
        mutateAsync: createOnboardingNotificationStateAsync,
        isLoading: isCreateLoading,
    } = useCreateOnboardingNotificationState({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: onboardingNotificationStateKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
            })
        },
    })

    const {
        mutateAsync: upsertOnboardingNotificationStateAsync,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    } = useUpsertOnboardingNotificationState({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: onboardingNotificationStateKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
            })
        },
    })

    const createOnboardingNotificationState = useCallback(
        async (
            fieldsToSubmit: CreateOnboardingNotificationStatePayload
        ): Promise<OnboardingNotificationState> => {
            const createdOnboardingNotificationState =
                await createOnboardingNotificationStateAsync([
                    accountDomain,
                    shopName,
                    fieldsToSubmit,
                ])

            return createdOnboardingNotificationState.data
                .onboardingNotificationState
        },
        [accountDomain, createOnboardingNotificationStateAsync, shopName]
    )

    const upsertOnboardingNotificationState = useCallback(
        async (
            fieldsToSubmit: UpsertOnboardingNotificationStatePayload
        ): Promise<OnboardingNotificationState> => {
            const upsertedOnboardingNotificationState =
                await upsertOnboardingNotificationStateAsync([
                    accountDomain,
                    shopName,
                    fieldsToSubmit,
                ])

            return upsertedOnboardingNotificationState.data
                .onboardingNotificationState
        },
        [accountDomain, shopName, upsertOnboardingNotificationStateAsync]
    )

    return {
        createOnboardingNotificationState,
        upsertOnboardingNotificationState,
        isLoading: isCreateLoading || isUpsertLoading,
        error: isUpsertError,
    }
}
