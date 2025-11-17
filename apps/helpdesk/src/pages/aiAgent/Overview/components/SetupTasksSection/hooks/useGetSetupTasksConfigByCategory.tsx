import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import type { PostStoreInstallationSteps } from 'models/aiAgentPostStoreInstallationSteps/types'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { TasksConfigByCategory } from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { TasksCategory } from 'pages/aiAgent/Overview/components/SetupTasksSection/types'
import { usePendingTasksRuleEngine } from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import { getCurrentDomain } from 'state/currentAccount/selectors'

import { createRuleEngineTaskMap, createStepMapper } from '../utils/utils'
import { usePopulatePostGoLiveSteps } from './usePopulatePostGoLiveSteps'
import { useSyncStepConfiguration } from './useSyncStepConfiguration'

interface UseGetSetupTasksConfigByCategoryParams {
    accountId: number
    shopName: string
    shopType: string
}

interface UseGetSetupTasksConfigByCategoryReturn {
    tasksConfigByCategory: Partial<TasksConfigByCategory>
    completionPercentage: number
    isLoading: boolean
    postGoLiveStepId: string | undefined
    postGoLiveStep: PostStoreInstallationSteps | undefined
    accountId: number
    error: unknown
}

export const useGetSetupTasksConfigByCategory = ({
    accountId,
    shopName,
    shopType,
}: UseGetSetupTasksConfigByCategoryParams): UseGetSetupTasksConfigByCategoryReturn => {
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

    const postGoLiveStep = useMemo(
        () =>
            data?.postStoreInstallationSteps?.find(
                (step) =>
                    step.type === PostStoreInstallationStepType.POST_GO_LIVE,
            ),
        [data],
    )

    usePopulatePostGoLiveSteps({
        postGoLiveStep,
        pendingTasks,
        completedTasks,
        enabled: !isRuleEngineLoading && !postGoLiveStep,
        accountId,
        shopName,
        shopType,
    })

    useSyncStepConfiguration({
        postGoLiveStep,
        pendingTasks,
        completedTasks,
        isRuleEngineLoading,
        accountId,
        shopName,
        shopType,
    })

    const tasksConfigByCategory: Partial<TasksConfigByCategory> =
        useMemo(() => {
            if (!postGoLiveStep?.stepsConfiguration?.length) {
                return {}
            }

            const postGoLiveSteps = postGoLiveStep.stepsConfiguration
            const ruleEngineTaskMap = createRuleEngineTaskMap(
                pendingTasks,
                completedTasks,
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

            const stepStartedMap = new Map(
                postGoLiveSteps.map((step) => [
                    step.stepName,
                    step.stepStartedDatetime,
                ]),
            )

            const mapStepsForCategory = createStepMapper(
                stepNamesFromDb,
                stepCompletionMap,
                stepStartedMap,
                ruleEngineTaskMap,
                shopName,
                shopType,
            )

            return Object.fromEntries(
                Object.values(TasksCategory)
                    .map((category) => [
                        category,
                        mapStepsForCategory(category),
                    ])
                    .filter(([, tasks]) => tasks.length > 0),
            ) as Partial<TasksConfigByCategory>
        }, [postGoLiveStep, pendingTasks, completedTasks, shopName, shopType])

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
        postGoLiveStepId: postGoLiveStep?.id,
        postGoLiveStep,
        accountId,
        error,
    }
}
