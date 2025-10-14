import { useCallback, useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    postStoreInstallationStepsKeys,
    useUpdatePostStoreInstallationStepPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationSteps,
    PostStoreInstallationStepStatus,
} from 'models/aiAgentPostStoreInstallationSteps/types'

interface UseMarkPostGoLiveStepCompletedParams {
    postGoLiveStepId: string | undefined
    postGoLiveStep: PostStoreInstallationSteps | undefined
    isAllTasksCompleted: boolean
    accountId: number
    shopName: string
}

interface UseMarkPostGoLiveStepCompletedReturn {
    showCompletionModal: boolean
    handleCloseModal: () => void
    triggerCompletionModal: () => void
}

export const useMarkPostGoLiveStepCompleted = ({
    postGoLiveStepId,
    postGoLiveStep,
    isAllTasksCompleted,
    accountId,
    shopName,
}: UseMarkPostGoLiveStepCompletedParams): UseMarkPostGoLiveStepCompletedReturn => {
    const queryClient = useQueryClient()
    const [showCompletionModal, setShowCompletionModal] = useState(false)

    const onMutationSuccess = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.detail({
                accountDomain: String(accountId),
                shopName,
            }),
        })
    }, [queryClient, accountId, shopName])

    const { mutateAsync: updatePostStoreInstallationStep } =
        useUpdatePostStoreInstallationStepPure({
            onSuccess: onMutationSuccess,
        })

    const isPostGoLiveStepCompleted = !!postGoLiveStep?.completedDatetime

    useEffect(() => {
        if (isAllTasksCompleted && !isPostGoLiveStepCompleted) {
            setShowCompletionModal(true)
        }
    }, [isAllTasksCompleted, isPostGoLiveStepCompleted])

    const handleCloseModal = useCallback(async () => {
        if (postGoLiveStepId) {
            try {
                await updatePostStoreInstallationStep([
                    postGoLiveStepId,
                    {
                        completedDatetime: new Date().toISOString(),
                        status: PostStoreInstallationStepStatus.COMPLETED,
                    },
                ])
            } catch (error) {
                console.error(
                    'Failed to mark POST_GO_LIVE as completed:',
                    error,
                )
            }
        }
        setShowCompletionModal(false)
    }, [postGoLiveStepId, updatePostStoreInstallationStep])

    const triggerCompletionModal = useCallback(() => {
        setShowCompletionModal(true)
    }, [])

    return {
        showCompletionModal,
        handleCloseModal,
        triggerCompletionModal,
    }
}
