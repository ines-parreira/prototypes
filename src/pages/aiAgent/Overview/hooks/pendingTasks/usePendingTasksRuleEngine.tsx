import { useEffect, useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { runRuleEngine } from './ruleEngine'
import { SetupAiAgentTask } from './tasks/SetupAiAgent.task'
import { Task } from './tasks/Task'
import { useFetchActionsData } from './useFetchActionsData'
import { useFetchAiAgentPlaygroundExecutionsData } from './useFetchAiAgentPlaygroundExecutionsData'
import { useFetchAiAgentStoreConfigurationData } from './useFetchAiAgentStoreConfigurationData'
import { useFetchChatIntegrationsStatusData } from './useFetchChatIntegrationsStatusData'
import { useFetchEmailIntegrationsData } from './useFetchEmailIntegrationsData'
import { useFetchFaqHelpCentersData } from './useFetchFaqHelpCentersData'
import { useFetchFileIngestionData } from './useFetchFileIngestionData'
import { useFetchGuidancesData } from './useFetchGuidancesData'
import { useFetchPageInteractionsData } from './useFetchPageInteractionsData'
import { useShopifyPermissionsData } from './useShopifyPermissionsData'
import { useTicketViewData } from './useTicketViewData'

// Until we have the full implementation of usePendingTasksRuleEngine
// we decided to fake the tasks in storybook to prevent having to mock things
const shouldFakeTasks = !!process.env.STORYBOOK

type Args = {
    accountDomain: string
    storeName: string
    storeType: string
    refetchOnWindowFocus?: boolean
}
export const usePendingTasksRuleEngine = ({
    accountDomain,
    storeName,
    storeType,
    refetchOnWindowFocus = true,
}: Args) => {
    const { routes } = useAiAgentNavigation({ shopName: storeName })

    const {
        isLoading: aiAgentStoreConfigurationIsLoading,
        data: aiAgentStoreConfigurationData,
        error: aiAgentStoreConfigurationInError,
    } = useFetchAiAgentStoreConfigurationData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
    })

    const { isLoading: faqHelpCentersDataIsLoading, data: faqHelpCentersData } =
        useFetchFaqHelpCentersData({ enabled: !shouldFakeTasks })

    const { isLoading: fileIngestionDataIsLoading, data: fileIngestionData } =
        useFetchFileIngestionData({
            storeName,
            enabled: !shouldFakeTasks,
            refetchOnWindowFocus,
        })

    const { isLoading: guidancesDataIsLoading, data: guidancesData } =
        useFetchGuidancesData({
            storeName,
            enabled: !shouldFakeTasks,
            refetchOnWindowFocus,
        })

    const { isLoading: actionsDataIsLoading, data: actionsData } =
        useFetchActionsData({
            storeName,
            enabled: !shouldFakeTasks,
            refetchOnWindowFocus,
        })

    const {
        isLoading: aiAgentPlaygroundExecutionsDataIsLoading,
        data: aiAgentPlaygroundExecutionsData,
    } = useFetchAiAgentPlaygroundExecutionsData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
    })

    const { isLoading: ticketViewDataIsLoading, data: ticketViewData } =
        useTicketViewData({
            accountDomain,
            refetchOnWindowFocus,
        })

    const { data: emailIntegrationsData } = useFetchEmailIntegrationsData()

    const { data: shopifyPermissionsData } = useShopifyPermissionsData({
        storeName,
    })

    const {
        isLoading: chatIntegrationsStatusDataIsLoading,
        data: chatIntegrationsStatusData,
    } = useFetchChatIntegrationsStatusData({
        chatIds: aiAgentStoreConfigurationData?.monitoredChatIntegrations ?? [],
        enabled: !shouldFakeTasks && !!aiAgentStoreConfigurationData,
        refetchOnWindowFocus,
    })

    const {
        isLoading: pageInteractionsDataIsLoading,
        data: pageInteractionsData,
    } = useFetchPageInteractionsData({
        storeName,
        storeType,
        refetchOnWindowFocus,
    })

    const isLoading =
        aiAgentStoreConfigurationIsLoading ||
        faqHelpCentersDataIsLoading ||
        fileIngestionDataIsLoading ||
        guidancesDataIsLoading ||
        actionsDataIsLoading ||
        aiAgentPlaygroundExecutionsDataIsLoading ||
        chatIntegrationsStatusDataIsLoading ||
        ticketViewDataIsLoading ||
        pageInteractionsDataIsLoading

    const isReady =
        !!aiAgentStoreConfigurationData &&
        !!faqHelpCentersData &&
        !!fileIngestionData &&
        !!guidancesData &&
        !!actionsData &&
        !!aiAgentPlaygroundExecutionsData &&
        !!emailIntegrationsData &&
        !!shopifyPermissionsData &&
        !!chatIntegrationsStatusData &&
        !!ticketViewData &&
        !!pageInteractionsData

    // Use memo instead of useEffect
    const [{ completedTasks, pendingTasks }, setTasks] = useState<{
        completedTasks: Task[]
        pendingTasks: Task[]
    }>({
        completedTasks: [],
        pendingTasks: [],
    })

    const isActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation, false)
    const isConvertFloatingChatInputEnabled = useFlag(
        FeatureFlagKey.ConvertFloatingChatInput,
        false,
    )

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
                        ticketView: ticketViewData,
                        pageInteractions: pageInteractionsData,
                        isActivationEnabled,
                        isConvertFloatingChatInputEnabled,
                    },
                    {
                        aiAgentRoutes: routes,
                    },
                ),
            )
        }
        /* eslint-disable react-hooks/exhaustive-deps */
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
        ticketViewData,
        pageInteractionsData,
        isActivationEnabled,
        isConvertFloatingChatInputEnabled,
    ]) /* eslint-enable react-hooks/exhaustive-deps */

    if (shouldFakeTasks) {
        return {
            isLoading: false,
            pendingTasks: [],
            completedTasks: [],
        }
    }

    // If no config, it means we want to display the setup task only
    if (aiAgentStoreConfigurationInError) {
        return {
            isLoading: false,
            pendingTasks: [
                // This task does
                new SetupAiAgentTask({
                    aiAgentRoutes: routes,
                }),
            ],
            completedTasks: [],
        }
    }

    return {
        isLoading,
        pendingTasks,
        completedTasks,
    }
}
