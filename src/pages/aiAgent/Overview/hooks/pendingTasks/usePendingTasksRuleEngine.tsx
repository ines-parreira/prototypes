import {useEffect, useState} from 'react'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {runRuleEngine} from './ruleEngine'
import {Task} from './tasks/Task'
import {useFetchActionsData} from './useFetchActionsData'
import {useFetchAiAgentPlaygroundExecutionsData} from './useFetchAiAgentPlaygroundExecutionsData'
import {useFetchAiAgentStoreConfigurationData} from './useFetchAiAgentStoreConfigurationData'
import {useFetchChatIntegrationsStatusData} from './useFetchChatIntegrationsStatusData'
import {useFetchEmailIntegrationsData} from './useFetchEmailIntegrationsData'
import {useFetchFaqHelpCentersData} from './useFetchFaqHelpCentersData'
import {useFetchFileIngestionData} from './useFetchFileIngestionData'
import {useFetchGuidancesData} from './useFetchGuidancesData'
import {useShopifyPermissionsData} from './useShopifyPermissionsData'

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

    const {isLoading: actionsDataIsLoading, data: actionsData} =
        useFetchActionsData({storeName, enabled: !shouldFakeTasks})

    const {
        isLoading: aiAgentPlaygroundExecutionsDataIsLoading,
        data: aiAgentPlaygroundExecutionsData,
    } = useFetchAiAgentPlaygroundExecutionsData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
    })

    const {data: emailIntegrationsData} = useFetchEmailIntegrationsData()

    const {data: shopifyPermissionsData} = useShopifyPermissionsData({
        storeName,
    })

    const {
        isLoading: chatIntegrationsStatusDataIsLoading,
        data: chatIntegrationsStatusData,
    } = useFetchChatIntegrationsStatusData({
        chatIds: aiAgentStoreConfigurationData?.monitoredChatIntegrations ?? [],
        enabled: !shouldFakeTasks && !!aiAgentStoreConfigurationData,
    })

    const isLoading =
        aiAgentStoreConfigurationIsLoading ||
        faqHelpCentersDataIsLoading ||
        fileIngestionDataIsLoading ||
        guidancesDataIsLoading ||
        actionsDataIsLoading ||
        aiAgentPlaygroundExecutionsDataIsLoading ||
        chatIntegrationsStatusDataIsLoading
    const isReady =
        !!aiAgentStoreConfigurationData &&
        !!faqHelpCentersData &&
        !!fileIngestionData &&
        !!guidancesData &&
        !!actionsData &&
        !!aiAgentPlaygroundExecutionsData &&
        !!emailIntegrationsData &&
        !!shopifyPermissionsData &&
        !!chatIntegrationsStatusData

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
                        actions: actionsData,
                        aiAgentPlaygroundExecutions:
                            aiAgentPlaygroundExecutionsData,
                        emailIntegrations: emailIntegrationsData,
                        shopifyIntegration: shopifyPermissionsData,
                        chatIntegrationsStatus: chatIntegrationsStatusData,
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
        actionsData,
        aiAgentPlaygroundExecutionsData,
        emailIntegrationsData,
        shopifyPermissionsData,
        chatIntegrationsStatusData,
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
