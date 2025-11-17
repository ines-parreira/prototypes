import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    postStoreInstallationStepsKeys,
    useUpdatePostStoreInstallationStepPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import type { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'

import type { TaskConfig } from '../types'

interface UseMarkAllTasksAsCompletedParams {
    postGoLiveStepId: string | undefined
    postGoLiveStepConfiguration: StepConfiguration[] | undefined
    tasksConfigByCategory: Partial<Record<string, TaskConfig[]>>
    accountId: number
    shopName: string
}

export const useMarkAllTasksAsCompleted = ({
    postGoLiveStepId,
    postGoLiveStepConfiguration,
    tasksConfigByCategory,
    accountId,
    shopName,
}: UseMarkAllTasksAsCompletedParams) => {
    const queryClient = useQueryClient()

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

    const markAllAsCompleted = useCallback(async () => {
        if (!postGoLiveStepId || !postGoLiveStepConfiguration) {
            return
        }

        try {
            const allTasks = Object.values(tasksConfigByCategory).flat()
            const completedDatetime = new Date().toISOString()

            const updatedStepsConfiguration = postGoLiveStepConfiguration.map(
                (step) => {
                    const task = allTasks.find(
                        (t) => t?.stepName === step.stepName,
                    )
                    if (task && !task.isCompleted) {
                        return {
                            ...step,
                            stepCompletedDatetime: completedDatetime,
                        }
                    }
                    return step
                },
            )

            await updatePostStoreInstallationStep([
                postGoLiveStepId,
                {
                    stepsConfiguration: updatedStepsConfiguration,
                },
            ])
        } catch (error) {
            console.error('Failed to mark all tasks as completed:', error)
        }
    }, [
        postGoLiveStepId,
        postGoLiveStepConfiguration,
        tasksConfigByCategory,
        updatePostStoreInstallationStep,
    ])

    return { markAllAsCompleted }
}
