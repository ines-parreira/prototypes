import { useCallback, useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    postStoreInstallationStepsKeys,
    useUpdateStepConfigurationPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationSteps } from 'models/aiAgentPostStoreInstallationSteps/types'
import { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'

import { createRuleEngineTaskMap } from '../utils/utils'

interface UseSyncStepConfigurationParams {
    postGoLiveStep: PostStoreInstallationSteps | undefined
    pendingTasks: Task[]
    completedTasks: Task[]
    isRuleEngineLoading: boolean
    accountId: number
    shopName: string
}

export const useSyncStepConfiguration = ({
    postGoLiveStep,
    pendingTasks,
    completedTasks,
    isRuleEngineLoading,
    accountId,
    shopName,
}: UseSyncStepConfigurationParams): void => {
    const queryClient = useQueryClient()
    const isSyncingRef = useRef(false)
    const syncedStepsRef = useRef<Set<string>>(new Set())

    const onMutationSuccess = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.detail({
                accountDomain: String(accountId),
                shopName,
            }),
        })
    }, [queryClient, accountId, shopName])

    const { mutateAsync: updateStepConfiguration } =
        useUpdateStepConfigurationPure({
            onSuccess: onMutationSuccess,
        })

    const syncTasks = useCallback(async () => {
        if (!postGoLiveStep) {
            isSyncingRef.current = false
            return
        }

        const ruleEngineTaskMap = createRuleEngineTaskMap(
            pendingTasks,
            completedTasks,
        )

        for (const dbStep of postGoLiveStep.stepsConfiguration) {
            const ruleEngineTask = ruleEngineTaskMap.get(dbStep.stepName)

            if (!ruleEngineTask || !ruleEngineTask.isCheckedAutomatically) {
                continue
            }

            const isCompletedInRuleEngine = ruleEngineTask.completed
            const isCompletedInDb = !!dbStep.stepCompletedDatetime

            const syncKey = `${dbStep.stepName}-${isCompletedInRuleEngine}`
            if (syncedStepsRef.current.has(syncKey)) {
                continue
            }

            if (
                isCompletedInRuleEngine !== isCompletedInDb &&
                !isCompletedInDb
            ) {
                try {
                    await updateStepConfiguration([
                        postGoLiveStep.id,
                        {
                            stepName: dbStep.stepName,
                            stepCompletedDatetime: isCompletedInRuleEngine
                                ? new Date().toISOString()
                                : null,
                        },
                    ])

                    syncedStepsRef.current.add(syncKey)
                } catch (error) {
                    console.error(
                        `Failed to sync step ${dbStep.stepName}:`,
                        error,
                    )
                }
            }
        }

        isSyncingRef.current = false
    }, [postGoLiveStep, pendingTasks, completedTasks, updateStepConfiguration])

    useEffect(() => {
        if (!postGoLiveStep || isRuleEngineLoading || isSyncingRef.current) {
            return
        }

        isSyncingRef.current = true
        void syncTasks()
    }, [postGoLiveStep, isRuleEngineLoading, syncTasks])
}
