import { useEffect, useMemo } from 'react'

import { Route, useParams, useRouteMatch } from 'react-router-dom'

import type { LANGUAGE } from 'constants/languages'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import {
    ChatPreviewChannelsContext,
    useChatPreviewChannels,
} from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'

import { AutomateSettingsFlowsAnalyticsRoute } from './flows-routes/AutomateSettingsFlowsAnalysisRoute'
import { AutomateSettingsFlowsBaseRoute } from './flows-routes/AutomateSettingsFlowsBaseRoute'
import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { AutomateSettingsFlowsEditRoute } from './flows-routes/AutomateSettingsFlowsEditRoute'
import { AutomateSettingsFlowsNewRoute } from './flows-routes/AutomateSettingsFlowsNewRoute'
import { FlowsSettingsHeader } from './FlowsSettingsHeader'
import { FlowsSettingsLegacyHeader } from './FlowsSettingsLegacyHeader'

import css from './FlowsSettings.less'

export const BASE_PATH = '/app/settings/flows'

export function FlowsSettings() {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { path } = useRouteMatch()
    const isChannelsRoute = useRouteMatch(`${path}/channels`)
    const { selected } = useStoreSelector(BASE_PATH)

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const { selectedChannelId, setSelectedChannelId } = useChatPreviewChannels(
        chatChannels[0]?.value.id,
    )

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]

    const appId = selectedChannel?.value.meta.app_id ?? null

    const { shouldShowFlowsScreensRevamp } = useShouldShowChatSettingsRevamp(
        selected,
        selectedChannelId,
    )

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const previewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelector
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
                onSelect={setSelectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, setSelectedChannelId, chatChannels])

    const {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        ...charPreviewPanelControls
    } = useChatPreviewPanel({
        headerActions: previewPanelHeaderActions,
        locale: selectedChannelLanguage,
    })

    useEffect(() => {
        if (shouldShowFlowsScreensRevamp && !!isChannelsRoute) {
            showPreviewPanel(appId)
        } else {
            hidePreviewPanel()
        }

        return hidePreviewPanel
    }, [
        shouldShowFlowsScreensRevamp,
        isChannelsRoute,
        showPreviewPanel,
        hidePreviewPanel,
        appId,
    ])

    return (
        <ChatPreviewChannelsContext.Provider
            value={{ selectedChannelId, setSelectedChannelId, shopName }}
        >
            <ChatPreviewPanelContext.Provider
                value={{ ...charPreviewPanelControls }}
            >
                <div className={css.container}>
                    {shouldShowFlowsScreensRevamp ? (
                        <FlowsSettingsHeader />
                    ) : (
                        <FlowsSettingsLegacyHeader />
                    )}

                    {!!selected && !!selectedPath && (
                        <>
                            <Route
                                path={path}
                                component={AutomateSettingsFlowsBaseRoute}
                            />
                            <Route
                                path={`${path}/new`}
                                exact
                                component={AutomateSettingsFlowsNewRoute}
                            />
                            <Route
                                path={`${path}/edit/:editWorkflowId`}
                                exact
                                component={AutomateSettingsFlowsEditRoute}
                            />
                            <Route
                                path={`${path}/analytics/:editWorkflowId`}
                                exact
                                component={AutomateSettingsFlowsAnalyticsRoute}
                            />
                            <Route
                                path={`${path}/channels`}
                                component={AutomateSettingsChannelsRoute}
                            />
                        </>
                    )}
                </div>
                {chatPreviewPortal}
            </ChatPreviewPanelContext.Provider>
        </ChatPreviewChannelsContext.Provider>
    )
}
