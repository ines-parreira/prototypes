import {useEffect, useState} from 'react'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {runRuleEngine} from './ruleEngine'
import {Task} from './tasks/Task'
import {useFetchAiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {useFetchHelpCenterData} from './useFetchHelpCenterData'

// Until we have the full implementation of usePendingTasksRuleEngine
// we decided to fake the tasks in storybook to prevent having to mock things
const shouldFakeTasks = !!process.env.STORYBOOK

type Args = {
    accountDomain: string
    storeName: string
}
export const usePendingTasksRuleEngine = ({accountDomain, storeName}: Args) => {
    // FeatureUrl part
    const {routes} = useAiAgentNavigation({shopName: storeName})

    const {
        data: aiAgentStoreConfigurationData,
        isLoading: aiAgentStoreConfigurationIsLoading,
    } = useFetchAiAgentStoreConfigurationData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
    })

    const {isLoading: helpCenterDataIsLoading, data: helpCenterData} =
        useFetchHelpCenterData({enabled: !shouldFakeTasks})

    const isLoading =
        aiAgentStoreConfigurationIsLoading || helpCenterDataIsLoading
    const isReady = !!aiAgentStoreConfigurationData && !!helpCenterData

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
                        helpCenters: helpCenterData,
                        aiAgentStoreConfiguration:
                            aiAgentStoreConfigurationData,
                    },
                    {
                        aiAgentRoutes: routes,
                    }
                )
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiAgentStoreConfigurationData])

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
