import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    postStoreInstallationStepsKeys,
    useCreatePostStoreInstallationStepPure,
    useUpdatePostStoreInstallationStepPure,
    useUpdateStepConfigurationPure,
    useUpdateStepNotificationsPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    CreatePostStoreInstallationStepPayload,
    PostStoreInstallationSteps,
    UpdateNotificationAcknowledgementRequest,
    UpdateStepRequest,
} from 'models/aiAgentPostStoreInstallationSteps/types'

export const usePostStoreInstallationStepsMutation = ({
    accountDomain,
    shopName,
}: {
    accountDomain: string
    shopName: string
}) => {
    const queryClient = useQueryClient()

    const invalidateQueries = async () => {
        void queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.detail({
                accountDomain,
                shopName,
            }),
        })

        await queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.all(),
        })
    }

    const { mutateAsync: createAsync, isLoading: isCreateLoading } =
        useCreatePostStoreInstallationStepPure({
            onSuccess: invalidateQueries,
        })

    const {
        mutateAsync: updateAsync,
        isLoading: isUpdateLoading,
        error: isUpdateError,
    } = useUpdatePostStoreInstallationStepPure({
        onSuccess: invalidateQueries,
    })

    const { mutateAsync: updateStepAsync, isLoading: isUpdateStepLoading } =
        useUpdateStepConfigurationPure({
            onSuccess: invalidateQueries,
        })

    const {
        mutateAsync: updateNotificationsAsync,
        isLoading: isUpdateNotificationsLoading,
    } = useUpdateStepNotificationsPure({
        onSuccess: invalidateQueries,
    })

    const createPostStoreInstallationStep = useCallback(
        async (
            data: CreatePostStoreInstallationStepPayload,
        ): Promise<PostStoreInstallationSteps> => {
            const createdStep = await createAsync([data])

            return createdStep.postStoreInstallationSteps
        },
        [createAsync],
    )

    const updatePostStoreInstallationStep = useCallback(
        async (
            id: string,
            data: Partial<PostStoreInstallationSteps>,
        ): Promise<PostStoreInstallationSteps> => {
            const updatedStep = await updateAsync([id, data])

            return updatedStep.postStoreInstallationSteps
        },
        [updateAsync],
    )

    const updateStepConfiguration = useCallback(
        async (
            id: string,
            stepData: UpdateStepRequest,
        ): Promise<PostStoreInstallationSteps> => {
            const updatedStep = await updateStepAsync([id, stepData])

            return updatedStep.postStoreInstallationSteps
        },
        [updateStepAsync],
    )

    const updateStepNotifications = useCallback(
        async (
            id: string,
            notificationData: UpdateNotificationAcknowledgementRequest,
        ): Promise<PostStoreInstallationSteps> => {
            const updatedStep = await updateNotificationsAsync([
                id,
                notificationData,
            ])

            return updatedStep.postStoreInstallationSteps
        },
        [updateNotificationsAsync],
    )

    return {
        createPostStoreInstallationStep,
        updatePostStoreInstallationStep,
        updateStepConfiguration,
        updateStepNotifications,
        isLoading:
            isCreateLoading ||
            isUpdateLoading ||
            isUpdateStepLoading ||
            isUpdateNotificationsLoading,
        error: isUpdateError,
    }
}
