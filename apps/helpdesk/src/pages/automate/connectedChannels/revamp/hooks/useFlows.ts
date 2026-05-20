import { useCallback, useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { Workflow } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/FlowsCard/types'

type UseFlowsParams = {
    shopName: string
    shopType: string
    selectedChannelId?: number
}

export const useFlows = ({
    shopName,
    shopType,
    selectedChannelId,
}: UseFlowsParams) => {
    const {
        selfServiceConfiguration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)

    const { data: workflowConfigurations = [] } = useGetWorkflowConfigurations()

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(
        () =>
            channels.filter(
                (c): c is SelfServiceChatChannel =>
                    c.type === TicketChannel.Chat,
            ),
        [channels],
    )

    const chatChannel = useMemo(
        () =>
            chatChannels.find((c) => c.value.id === selectedChannelId) ??
            chatChannels.at(0),
        [chatChannels, selectedChannelId],
    )
    const appId = useMemo(() => chatChannel?.value.meta.app_id, [chatChannel])

    const {
        applicationsAutomationSettings,
        isFetchPending: isAutomationSettingsFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appId ? [appId] : [])

    const automationSettingsWorkflows = useMemo(() => {
        if (!appId) return []
        return (
            applicationsAutomationSettings?.[appId]?.workflows?.entrypoints ??
            []
        )
    }, [applicationsAutomationSettings, appId])

    const primaryLanguage = useMemo(
        () => getPrimaryLanguageFromChatConfig(chatChannel?.value.meta),
        [chatChannel?.value.meta],
    )

    const isLoading =
        isSelfServiceConfigurationFetchPending ||
        isAutomationSettingsFetchPending

    const buildUpdatePayload = useCallback(
        (nextEntrypoints: Workflow[]) => {
            if (!appId) return null
            const applicationAutomationSettings =
                applicationsAutomationSettings?.[appId]
            if (!applicationAutomationSettings) return null
            return {
                ...applicationAutomationSettings,
                workflows: {
                    ...applicationAutomationSettings.workflows,
                    entrypoints: nextEntrypoints,
                },
            }
        },
        [appId, applicationsAutomationSettings],
    )

    const handleFlowAdd = useCallback(
        async (nextEntrypoints: Workflow[]) => {
            const payload = buildUpdatePayload(nextEntrypoints)
            if (!payload) return
            await handleChatApplicationAutomationSettingsUpdate(
                payload,
                'Flow added',
            )
        },
        [buildUpdatePayload, handleChatApplicationAutomationSettingsUpdate],
    )

    const handleFlowRemove = useCallback(
        async (nextEntrypoints: Workflow[]) => {
            const payload = buildUpdatePayload(nextEntrypoints)
            if (!payload) return
            await handleChatApplicationAutomationSettingsUpdate(
                payload,
                'Flow removed',
            )
        },
        [buildUpdatePayload, handleChatApplicationAutomationSettingsUpdate],
    )

    const handleFlowReorder = useCallback(
        async (nextEntrypoints: Workflow[]) => {
            const payload = buildUpdatePayload(nextEntrypoints)
            if (!payload) return
            await handleChatApplicationAutomationSettingsUpdate(
                payload,
                'Flows order updated',
            )
        },
        [buildUpdatePayload, handleChatApplicationAutomationSettingsUpdate],
    )

    return {
        isLoading,
        channel: chatChannel,
        primaryLanguage,
        workflowEntrypoints: selfServiceConfiguration?.workflowsEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
        handleFlowAdd,
        handleFlowRemove,
        handleFlowReorder,
    }
}
