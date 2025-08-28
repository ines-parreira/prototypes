import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetAlreadyUsedEmailIntegrationIds } from 'pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { runRuleEngine } from './ruleEngine'
import { SetupAiAgentTask } from './tasks/SetupAiAgent.task'
import { useFetchActionsData } from './useFetchActionsData'
import { useFetchAiAgentPlaygroundExecutionsData } from './useFetchAiAgentPlaygroundExecutionsData'
import { useFetchAiAgentStoreConfigurationData } from './useFetchAiAgentStoreConfigurationData'
import { useFetchChatIntegrationsStatusData } from './useFetchChatIntegrationsStatusData'
import { useFetchEmailIntegrationsData } from './useFetchEmailIntegrationsData'
import { useFetchFaqHelpCentersData } from './useFetchFaqHelpCentersData'
import { useFetchFileIngestionData } from './useFetchFileIngestionData'
import { useFetchGuidancesData } from './useFetchGuidancesData'
import { useFetchPageInteractionsData } from './useFetchPageInteractionsData'
import { useFetchStoreKnowledgeStatusData } from './useFetchStoreKnowledgeStatusData'
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
        isFetched: aiAgentStoreConfigurationIsFetched,
        data: aiAgentStoreConfigurationData,
        error: aiAgentStoreConfigurationInError,
    } = useFetchAiAgentStoreConfigurationData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
    })

    const {
        isLoading: faqHelpCentersDataIsLoading,
        isFetched: FaqHelpCentersDataIsFetched,
        data: faqHelpCentersData,
    } = useFetchFaqHelpCentersData({
        enabled: !shouldFakeTasks,
        retries: false,
    })

    const {
        isLoading: fileIngestionDataIsLoading,
        isFetched: fileIngestionDataIsFetched,
        data: fileIngestionData,
    } = useFetchFileIngestionData({
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
        retries: false,
    })

    const {
        isLoading: guidancesDataIsLoading,
        isFetched: guidancesDataIsFetched,
        data: guidancesData,
    } = useFetchGuidancesData({
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
        retries: false,
    })

    const {
        isLoading: actionsDataIsLoading,
        isFetched: actionDataIsFetched,
        data: actionsData,
    } = useFetchActionsData({
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
        retries: false,
    })

    const {
        isLoading: aiAgentPlaygroundExecutionsDataIsLoading,
        isFetched: aiAgentPlaygroundExecutionsDataIsFetched,
        data: aiAgentPlaygroundExecutionsData,
    } = useFetchAiAgentPlaygroundExecutionsData({
        accountDomain,
        storeName,
        enabled: !shouldFakeTasks,
        refetchOnWindowFocus,
        retries: false,
    })

    const { isLoading: ticketViewDataIsLoading, data: ticketViewData } =
        useTicketViewData({
            accountDomain,
            refetchOnWindowFocus,
            retries: false,
        })

    const { data: emailIntegrationsData } = useFetchEmailIntegrationsData()

    const alreadyUsedEmailIntegrationsIds =
        useGetAlreadyUsedEmailIntegrationIds(storeName)

    const { data: shopifyPermissionsData } = useShopifyPermissionsData({
        storeName,
    })

    const {
        isLoading: chatIntegrationsStatusDataIsLoading,
        isFetched: chatIntegrationsStatusDataIsFetched,
        data: chatIntegrationsStatusData,
    } = useFetchChatIntegrationsStatusData({
        chatIds: aiAgentStoreConfigurationData?.monitoredChatIntegrations ?? [],
        enabled: !shouldFakeTasks && !!aiAgentStoreConfigurationData,
        refetchOnWindowFocus,
    })

    const {
        data: storeKnowledgeStatusData,
        isLoading: isStoresKnowledgeStatusDataLoading,
    } = useFetchStoreKnowledgeStatusData({
        storeName,
        enabled: !shouldFakeTasks,
    })

    const selfServiceChatChannels = useSelfServiceChatChannels(
        storeType,
        storeName,
    )

    const {
        isLoading: pageInteractionsDataIsLoading,
        isFetched: pageInteractionsDataIsFetched,
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
        pageInteractionsDataIsLoading ||
        isStoresKnowledgeStatusDataLoading

    const isFetched =
        aiAgentStoreConfigurationIsFetched &&
        FaqHelpCentersDataIsFetched &&
        fileIngestionDataIsFetched &&
        guidancesDataIsFetched &&
        actionDataIsFetched &&
        aiAgentPlaygroundExecutionsDataIsFetched &&
        chatIntegrationsStatusDataIsFetched &&
        pageInteractionsDataIsFetched

    const isReady = !!aiAgentStoreConfigurationData

    const isActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation, false)
    const isStandaloneMerchant = useFlag(
        FeatureFlagKey.StandaloneHandoverCapabilities,
        false,
    )
    const isAiShoppingAssistantEnabled = !!useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
        false,
    )

    const isAiSalesAgentHelpOnSearchTemplateQueryEnabled = useFlag(
        FeatureFlagKey.AiSalesAgentHelpOnSearchTemplateQuery,
        false,
    )

    // Calculate tasks using useMemo to prevent infinite rerenders
    const { completedTasks, pendingTasks } = useMemo(() => {
        if (!isReady) {
            return { completedTasks: [], pendingTasks: [] }
        }

        return runRuleEngine(
            {
                faqHelpCenters: faqHelpCentersData,
                aiAgentStoreConfiguration: aiAgentStoreConfigurationData,
                fileIngestion: fileIngestionData,
                guidances: guidancesData,
                actions: actionsData,
                aiAgentPlaygroundExecutions: aiAgentPlaygroundExecutionsData,
                emailIntegrations: emailIntegrationsData,
                shopifyIntegration: shopifyPermissionsData,
                chatIntegrationsStatus: chatIntegrationsStatusData,
                ticketView: ticketViewData,
                pageInteractions: pageInteractionsData,
                isActivationEnabled,
                isAiShoppingAssistantEnabled,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled,
                selfServiceChatChannels,
                storeKnowledgeStatus: storeKnowledgeStatusData,
                alreadyUsedEmailIntegrationsIds,
                isStandaloneMerchant,
            },
            {
                aiAgentRoutes: routes,
            },
        )
    }, [
        isReady,
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
        isAiShoppingAssistantEnabled,
        isAiSalesAgentHelpOnSearchTemplateQueryEnabled,
        selfServiceChatChannels,
        storeKnowledgeStatusData,
        alreadyUsedEmailIntegrationsIds,
        isStandaloneMerchant,
        routes,
    ])

    if (shouldFakeTasks) {
        return {
            isLoading: false,
            isFetched: true,
            pendingTasks: [],
            completedTasks: [],
        }
    }

    // If no config, it means we want to display the setup task only
    if (aiAgentStoreConfigurationInError) {
        return {
            isLoading: false,
            isFetched: true,
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
        isFetched,
        pendingTasks,
        completedTasks,
    }
}
