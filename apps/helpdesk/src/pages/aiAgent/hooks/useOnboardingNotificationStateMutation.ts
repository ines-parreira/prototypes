import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    onboardingNotificationStateKeys,
    useCreateOnboardingNotificationState,
    useUpsertOnboardingNotificationState,
} from 'models/aiAgent/queries'
import type {
    CreateOnboardingNotificationStatePayload,
    OnboardingNotificationState,
    UpsertOnboardingNotificationStatePayload,
} from 'models/aiAgent/types'

type Params = {
    accountDomain: string
    shopName: string | undefined
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
            fieldsToSubmit: CreateOnboardingNotificationStatePayload,
        ): Promise<OnboardingNotificationState> => {
            const createdOnboardingNotificationState =
                await createOnboardingNotificationStateAsync([
                    accountDomain,
                    fieldsToSubmit.shopName,
                    fieldsToSubmit,
                ])

            return createdOnboardingNotificationState.data
                .onboardingNotificationState
        },
        [accountDomain, createOnboardingNotificationStateAsync],
    )

    const upsertOnboardingNotificationState = useCallback(
        async (
            fieldsToSubmit: UpsertOnboardingNotificationStatePayload,
        ): Promise<OnboardingNotificationState> => {
            const upsertedOnboardingNotificationState =
                await upsertOnboardingNotificationStateAsync([
                    accountDomain,
                    fieldsToSubmit.shopName,
                    fieldsToSubmit,
                ])

            return upsertedOnboardingNotificationState.data
                .onboardingNotificationState
        },
        [accountDomain, upsertOnboardingNotificationStateAsync],
    )

    return {
        createOnboardingNotificationState,
        upsertOnboardingNotificationState,
        isLoading: isCreateLoading || isUpsertLoading,
        error: isUpsertError,
    }
}
