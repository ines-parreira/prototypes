import { useCallback, useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    postStoreInstallationStepsKeys,
    useCreatePostStoreInstallationStepPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationSteps,
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepConfiguration,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'

import { TASK_CONFIG_TEMPLATES } from '../config'
import { createRuleEngineTaskMap } from '../utils/utils'

interface UsePopulatePostGoLiveStepsParams {
    postGoLiveStep: PostStoreInstallationSteps | undefined
    pendingTasks: Task[]
    completedTasks: Task[]
    enabled: boolean
    accountId: number
    shopName: string
    shopType: string
}

export const usePopulatePostGoLiveSteps = ({
    postGoLiveStep,
    pendingTasks,
    completedTasks,
    enabled,
    accountId,
    shopName,
    shopType,
}: UsePopulatePostGoLiveStepsParams): void => {
    const queryClient = useQueryClient()
    const hasPopulatedRef = useRef(false)

    const onMutationSuccess = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.detail({
                accountDomain: String(accountId),
                shopName,
            }),
        })
    }, [queryClient, accountId, shopName])

    const { mutateAsync: createPostStoreInstallationStep, isLoading } =
        useCreatePostStoreInstallationStepPure({
            onSuccess: onMutationSuccess,
        })

    const populateSteps = useCallback(async () => {
        if (hasPopulatedRef.current) {
            return
        }

        hasPopulatedRef.current = true

        const allStepsFromConfig = Object.values(TASK_CONFIG_TEMPLATES)
            .flat()
            .map((template) => template.stepName)

        const ruleEngineTaskMap = createRuleEngineTaskMap(
            pendingTasks,
            completedTasks,
        )

        const availableStepsInRuleEngine: StepName[] = []
        for (const stepName of allStepsFromConfig) {
            const ruleEngineTask = ruleEngineTaskMap.get(stepName)
            if (
                ruleEngineTask &&
                ruleEngineTask.available &&
                (ruleEngineTask.alwaysAvailable || !ruleEngineTask.completed)
            ) {
                availableStepsInRuleEngine.push(stepName)
            }
        }

        if (availableStepsInRuleEngine.length === 0) {
            return
        }

        const stepsConfiguration: StepConfiguration[] =
            availableStepsInRuleEngine.map((stepName) => ({
                stepName,
                stepStartedDatetime: null,
                stepCompletedDatetime: null,
                stepDismissedDatetime: null,
            }))

        try {
            await createPostStoreInstallationStep([
                {
                    accountId,
                    shopName,
                    shopType,
                    status: PostStoreInstallationStepStatus.IN_PROGRESS,
                    type: PostStoreInstallationStepType.POST_GO_LIVE,
                    stepsConfiguration,
                    notificationsConfiguration: null,
                    completedDatetime: null,
                },
            ])
        } catch (error) {
            console.error('Failed to create POST_GO_LIVE step:', error)
        }
    }, [
        pendingTasks,
        completedTasks,
        accountId,
        shopName,
        shopType,
        createPostStoreInstallationStep,
    ])

    useEffect(() => {
        if (postGoLiveStep || !enabled || isLoading) {
            return
        }

        void populateSteps()
    }, [postGoLiveStep, enabled, isLoading, populateSteps])
}
