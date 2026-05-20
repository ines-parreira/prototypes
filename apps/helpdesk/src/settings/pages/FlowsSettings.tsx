import { useCallback, useEffect, useMemo, useState } from 'react'

import { Route, useParams, useRouteMatch } from 'react-router-dom'

import type { LANGUAGE } from 'constants/languages'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { isSelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { ConnectedChannelsContextType } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import ConnectedChannelsContext from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { ChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChannelSelector/ChannelSelector'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
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

    const [channel, setChannel] = useState<SelfServiceChatChannel | undefined>(
        chatChannels.at(0),
    )

    const appId = useMemo(() => channel?.value.meta.app_id ?? null, [channel])

    const { shouldShowFlowsScreensRevamp } = useShouldShowChatSettingsRevamp(
        selected,
        channel?.value.id,
    )

    const handleChannelChange = useCallback(
        (c: SelfServiceChannel | undefined) => {
            if (c === undefined || isSelfServiceChatChannel(c)) {
                setChannel(c)
            }
        },
        [],
    )

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            channel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [channel])

    const previewPanelHeaderActions = useMemo(() => {
        const firstChannel = chatChannels.at(0)
        if (!firstChannel) return undefined
        return (
            <ChannelSelector
                channels={chatChannels}
                selectedChannel={channel ?? firstChannel}
                onSelect={handleChannelChange}
            />
        )
    }, [channel, chatChannels, handleChannelChange])

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
        const firstChannel = chatChannels.at(0)
        if (!channel && firstChannel) {
            setChannel(firstChannel)
        }
    }, [chatChannels, channel])

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

    const connectedChannelsContextValue = useMemo<ConnectedChannelsContextType>(
        () => ({
            channels: chatChannels,
            channel: channel,
            onChannelChange: handleChannelChange,
        }),
        [chatChannels, channel, handleChannelChange],
    )

    return (
        <ConnectedChannelsContext.Provider
            value={connectedChannelsContextValue}
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
        </ConnectedChannelsContext.Provider>
    )
}
