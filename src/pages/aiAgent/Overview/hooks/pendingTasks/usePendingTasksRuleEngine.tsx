import {useEffect, useState} from 'react'

import {useGetStoreConfigurationPure} from 'models/aiAgent/queries'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {runRuleEngine} from './ruleEngine'
import {Task} from './tasks/Task'

// Until we have the full implementation of usePendingTasksRuleEngine
// we decided to fake the tasks in storybook to prevent having to mock things
const shouldFakeTasks = !!process.env.STORYBOOK

export const usePendingTasksRuleEngine = (
    accountDomain: string,
    storeName: string
) => {
    // FeatureUrl part
    const {routes} = useAiAgentNavigation({shopName: storeName})

    const {
        data: aiAgentStoreConfigurationData,
        isLoading: aiAgentStoreConfigurationIsLoading,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName,
        },
        {enabled: !shouldFakeTasks}
    )

    const isLoading = aiAgentStoreConfigurationIsLoading
    const isReady = !!aiAgentStoreConfigurationData?.data

    // Use memo instead of useEffect
    const [{completedTasks, pendingTasks}, setTasks] = useState<{
        completedTasks: Task[]
        pendingTasks: Task[]
    }>({
        completedTasks: [],
        pendingTasks: [],
    })

    useEffect(() => {
        if (isReady) {
            setTasks(
                runRuleEngine(
                    {
                        aiAgentStoreConfiguration:
                            aiAgentStoreConfigurationData.data
                                .storeConfiguration,
                    },
                    {
                        aiAgentRoutes: routes,
                    }
                )
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiAgentStoreConfigurationData, routes])

    if (shouldFakeTasks) {
        return {
            isLoading: false,
            pendingTasks: [],
            completedTasks: [],
        }
    }

    return {
        isLoading,
        pendingTasks,
        completedTasks,
    }
}
