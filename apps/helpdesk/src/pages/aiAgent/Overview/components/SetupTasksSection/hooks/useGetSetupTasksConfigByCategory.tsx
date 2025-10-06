import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
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

    const tasksConfigByCategory: Partial<TasksConfigByCategory> =
        useMemo(() => {
            const postGoLiveSteps =
                data?.postStoreInstallationSteps?.find(
                    (step) =>
                        step.type ===
                        PostStoreInstallationStepType.POST_GO_LIVE,
                )?.stepsConfiguration || []

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
                        const isCompletedInRuleEngine =
                            ruleEngineTask !== undefined &&
                            !ruleEngineTask.display

                        return {
                            stepName: template.stepName,
                            displayName: template.displayName,
                            isCompleted: isCompletedInRuleEngine,
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
        }, [data, pendingTasks, completedTasks])

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
