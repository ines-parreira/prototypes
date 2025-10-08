import { useEffect, useMemo, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import {
    postStoreInstallationStepsKeys,
    useGetPostStoreInstallationStepsPure,
    useUpdateStepConfigurationPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import {
    RULE_ENGINE_TASK_TO_STEP_NAME,
    TASK_CONFIG_TEMPLATES,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/config'
import {
    TaskConfig,
    TasksCategory,
    TasksConfigByCategory,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'
import { usePendingTasksRuleEngine } from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import { getCurrentDomain } from 'state/currentAccount/selectors'

interface UseGetSetupTasksConfigByCategoryParams {
    accountId: number
    shopName: string
    shopType: string
}

export const useGetSetupTasksConfigByCategory = ({
    accountId,
    shopName,
    shopType,
}: UseGetSetupTasksConfigByCategoryParams) => {
    const accountDomain = useAppSelector(getCurrentDomain)
    const queryClient = useQueryClient()
    const isSyncingRef = useRef(false)
    const syncedStepsRef = useRef<Set<string>>(new Set())

    const {
        data,
        isLoading: isDbLoading,
        error,
    } = useGetPostStoreInstallationStepsPure(
        {
            accountId,
            shopName,
            shopType,
        },
        {
            enabled: !!accountId && !!shopName && !!shopType,
        },
    )

    const {
        isLoading: isRuleEngineLoading,
        pendingTasks,
        completedTasks,
    } = usePendingTasksRuleEngine({
        accountDomain,
        storeName: shopName,
        storeType: shopType,
        refetchOnWindowFocus: false,
        additionalScope: 'overview',
    })

    const { mutateAsync: updateStepConfiguration } =
        useUpdateStepConfigurationPure()

    const postGoLiveStep = useMemo(
        () =>
            data?.postStoreInstallationSteps?.find(
                (step) =>
                    step.type === PostStoreInstallationStepType.POST_GO_LIVE,
            ),
        [data],
    )

    useEffect(() => {
        if (!postGoLiveStep || isRuleEngineLoading || isSyncingRef.current) {
            return
        }

        const allRuleEngineTasks = [...pendingTasks, ...completedTasks]
        const ruleEngineTaskMap = new Map<StepName, Task>(
            allRuleEngineTasks
                .map((task) => {
                    const stepName = RULE_ENGINE_TASK_TO_STEP_NAME.get(
                        task.constructor.name,
                    )
                    return [stepName, task] as const
                })
                .filter(
                    (entry): entry is [StepName, Task] =>
                        entry[0] !== undefined,
                ),
        )

        const syncTasks = async () => {
            isSyncingRef.current = true
            let hasChanges = false

            for (const dbStep of postGoLiveStep.stepsConfiguration) {
                const ruleEngineTask = ruleEngineTaskMap.get(dbStep.stepName)

                if (!ruleEngineTask) {
                    continue
                }

                if (!ruleEngineTask.isCheckedAutomatically) {
                    continue
                }

                const isCompletedInRuleEngine = !ruleEngineTask.display
                const isCompletedInDb = !!dbStep.stepCompletedDatetime

                const syncKey = `${dbStep.stepName}-${isCompletedInRuleEngine}`
                if (syncedStepsRef.current.has(syncKey)) {
                    continue
                }

                if (isCompletedInRuleEngine !== isCompletedInDb) {
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
                        hasChanges = true
                    } catch (error) {
                        console.error(
                            `Failed to sync step ${dbStep.stepName}:`,
                            error,
                        )
                    }
                }
            }

            if (hasChanges) {
                await queryClient.invalidateQueries({
                    queryKey: postStoreInstallationStepsKeys.detail({
                        accountDomain: String(accountId),
                        shopName,
                    }),
                })
            }

            isSyncingRef.current = false
        }

        syncTasks()
    }, [
        postGoLiveStep,
        pendingTasks,
        completedTasks,
        isRuleEngineLoading,
        updateStepConfiguration,
        queryClient,
        accountId,
        shopName,
    ])

    const tasksConfigByCategory: Partial<TasksConfigByCategory> =
        useMemo(() => {
            if (!postGoLiveStep) {
                return {}
            }

            const postGoLiveSteps = postGoLiveStep.stepsConfiguration

            if (postGoLiveSteps.length === 0) {
                return {}
            }

            const allRuleEngineTasks = [...pendingTasks, ...completedTasks]

            const ruleEngineTaskMap = new Map<StepName, Task>(
                allRuleEngineTasks
                    .map((task) => {
                        const stepName = RULE_ENGINE_TASK_TO_STEP_NAME.get(
                            task.constructor.name,
                        )
                        return [stepName, task] as const
                    })
                    .filter(
                        (entry): entry is [StepName, Task] =>
                            entry[0] !== undefined,
                    ),
            )

            const stepNamesFromDb = new Set(
                postGoLiveSteps.map((step) => step.stepName),
            )

            const stepCompletionMap = new Map(
                postGoLiveSteps.map((step) => [
                    step.stepName,
                    !!step.stepCompletedDatetime,
                ]),
            )

            const mapStepsForCategory = (
                category: TasksCategory,
            ): TaskConfig[] => {
                return TASK_CONFIG_TEMPLATES[category]
                    .filter((template) =>
                        stepNamesFromDb.has(template.stepName),
                    )
                    .map((template) => {
                        const ruleEngineTask = ruleEngineTaskMap.get(
                            template.stepName,
                        )
                        return {
                            stepName: template.stepName,
                            displayName: template.displayName,
                            isCompleted:
                                stepCompletionMap.get(template.stepName) ??
                                false,
                            body: template.bodyComponent,
                            featureUrl: ruleEngineTask?.featureUrl,
                        }
                    })
            }

            return Object.fromEntries(
                Object.values(TasksCategory)
                    .map((category) => [
                        category,
                        mapStepsForCategory(category),
                    ])
                    .filter(([, tasks]) => tasks.length > 0),
            ) as Partial<TasksConfigByCategory>
        }, [postGoLiveStep, pendingTasks, completedTasks])

    const completionPercentage = useMemo(() => {
        const allTasks = Object.values(tasksConfigByCategory).flat()
        if (allTasks.length === 0) {
            return 0
        }
        const completedCount = allTasks.filter(
            (task) => task.isCompleted,
        ).length
        return Math.round((completedCount / allTasks.length) * 100)
    }, [tasksConfigByCategory])

    return {
        tasksConfigByCategory,
        completionPercentage,
        isLoading: isDbLoading || isRuleEngineLoading,
        error,
    }
}
