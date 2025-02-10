import {useEffect, useState} from 'react'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {runRuleEngine} from './ruleEngine'
import {Task} from './tasks/Task'
import {useFetchAiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {useFetchFaqHelpCentersData} from './useFetchFaqHelpCentersData'
import {useFetchFileIngestionData} from './useFetchFileIngestionData'
import {useFetchGuidancesData} from './useFetchGuidancesData'

// Until we have the full implementation of usePendingTasksRuleEngine
// we decided to fake the tasks in storybook to prevent having to mock things
const shouldFakeTasks = !!process.env.STORYBOOK

type Args = {
    accountDomain: string
    storeName: string
}
export const usePendingTasksRuleEngine = ({accountDomain, storeName}: Args) => {
    const {routes} = useAiAgentNavigation({shopName: storeName})

    const {
        isLoading: aiAgentStoreConfigurationIsLoading,
        data: aiAgentStoreConfigurationData,
    } = useFetchAiAgentStoreConfigurationData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
    })

    const {isLoading: faqHelpCentersDataIsLoading, data: faqHelpCentersData} =
        useFetchFaqHelpCentersData({enabled: !shouldFakeTasks})

    const {isLoading: fileIngestionDataIsLoading, data: fileIngestionData} =
        useFetchFileIngestionData(storeName, !shouldFakeTasks)

    const {isLoading: guidancesDataIsLoading, data: guidancesData} =
        useFetchGuidancesData({storeName, enabled: !shouldFakeTasks})

    const isLoading =
        aiAgentStoreConfigurationIsLoading ||
        faqHelpCentersDataIsLoading ||
        fileIngestionDataIsLoading ||
        guidancesDataIsLoading
    const isReady =
        !!aiAgentStoreConfigurationData &&
        !!faqHelpCentersData &&
        !!fileIngestionData &&
        !!guidancesData

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
                        faqHelpCenters: faqHelpCentersData,
                        aiAgentStoreConfiguration:
                            aiAgentStoreConfigurationData,
                        fileIngestion: fileIngestionData,
                        guidances: guidancesData,
                    },
                    {
                        aiAgentRoutes: routes,
                    }
                )
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        aiAgentStoreConfigurationData,
        faqHelpCentersData,
        fileIngestionData,
        guidancesData,
    ])

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
