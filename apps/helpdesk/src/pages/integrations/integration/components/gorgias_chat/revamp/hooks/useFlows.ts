import { useMemo } from 'react'

import type { Map } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

type UseFlowsParams = {
    integration: Map<any, any>
}

export function useFlows({ integration }: UseFlowsParams) {
    const gorgiasChatIntegration: GorgiasChatIntegration = integration.toJS()
    const appId = gorgiasChatIntegration?.meta?.app_id
    const shopName = gorgiasChatIntegration?.meta?.shop_name ?? ''
    const shopType = gorgiasChatIntegration?.meta?.shop_type ?? ''

    const {
        selfServiceConfiguration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)

    const { data: workflowConfigurations = [] } = useGetWorkflowConfigurations()

    const {
        applicationsAutomationSettings,
        isFetchPending: isAutomationSettingsFetchPending,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const automationSettingsWorkflows = useMemo(() => {
        if (!appId) return []
        return (
            applicationsAutomationSettings?.[appId]?.workflows?.entrypoints ??
            []
        )
    }, [applicationsAutomationSettings, appId])

    const channel: SelfServiceChatChannel = useMemo(
        () => ({
            type: TicketChannel.Chat,
            value: gorgiasChatIntegration,
        }),
        [gorgiasChatIntegration],
    )

    const primaryLanguage = useMemo(
        () => getPrimaryLanguageFromChatConfig(gorgiasChatIntegration?.meta),
        [gorgiasChatIntegration?.meta],
    )

    const isLoading =
        isSelfServiceConfigurationFetchPending ||
        isAutomationSettingsFetchPending

    return {
        isLoading,
        shopName,
        shopType,
        channel,
        primaryLanguage,
        workflowEntrypoints: selfServiceConfiguration?.workflowsEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
    }
}
