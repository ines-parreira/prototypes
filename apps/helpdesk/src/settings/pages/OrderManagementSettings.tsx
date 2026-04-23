import { useEffect, useMemo } from 'react'

import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'
import { IntegrationType } from 'models/integration/constants'
import { isSelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import {
    ChatPreviewChannelsContext,
    useChatPreviewChannels,
    useChatPreviewChannelsContext,
} from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useOrderManagementPreviewContext } from 'pages/automate/orderManagement/legacy/OrderManagementPreviewContext'
import OrderManagementPreviewProvider from 'pages/automate/orderManagement/legacy/OrderManagementPreviewProvider'
import { OrderManagementViewContainer } from 'pages/automate/orderManagement/OrderManagementViewContainer'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreSelector } from 'settings/automate'

import { AutomateSettingsChannelsRoute } from './flows-routes/AutomateSettingsFlowsChannelsRoute'
import { OrderManagementCancelRoute } from './order-management-routes/OrderManagementCancelRoute'
import { OrderManagementReportEditRoute } from './order-management-routes/OrderManagementReportEditRoute'
import { OrderManagementReportNewScenarioRoute } from './order-management-routes/OrderManagementReportNewScenarioRoute'
import { OrderManagementReportRoute } from './order-management-routes/OrderManagementReportRoute'
import { OrderManagementReturnRoute } from './order-management-routes/OrderManagementReturnRoute'
import { OrderManagementTrackRoute } from './order-management-routes/OrderManagementTrackRoute'
import { OrderManagementSettingsHeader } from './OrderManagementSettingsHeader'
import { OrderManagementSettingsLegacyHeader } from './OrderManagementSettingsLegacyHeader'

import css from './OrderManagementSettings.less'

const ChatChannelSelectorWithSync = ({
    chatChannels,
    selectedChannelId,
}: {
    chatChannels: SelfServiceChatChannel[]
    selectedChannelId: number | undefined
}) => {
    const { setSelectedChannelId } = useChatPreviewChannelsContext()
    const { channels, onChannelChange } = useOrderManagementPreviewContext()

    return (
        <ChatChannelSelector
            chatChannels={chatChannels}
            selectedChannelId={selectedChannelId}
            onSelect={(channelId) => {
                setSelectedChannelId(channelId)
                const channel = channels.find(
                    (
                        selectedChannel,
                    ): selectedChannel is SelfServiceChatChannel =>
                        isSelfServiceChatChannel(selectedChannel) &&
                        selectedChannel.value.id === channelId,
                )
                if (channel) {
                    onChannelChange(channel)
                }
            }}
        />
    )
}

export const BASE_PATH = '/app/settings/order-management'

export function OrderManagementSettings() {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const { path } = useRouteMatch()
    const isChannelsRoute = useRouteMatch(`${path}/channels`)
    const isOnRevampFlowPage = useRouteMatch([
        `${path}/cancel`,
        `${path}/return`,
        `${path}/track`,
        `${path}/report-issue`,
    ])
    const { selected } = useStoreSelector(BASE_PATH, [IntegrationType.Shopify])

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
        : undefined

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const { selectedChannelId, setSelectedChannelId } = useChatPreviewChannels(
        chatChannels[0]?.value.id,
    )

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]

    const appId = selectedChannel?.value.meta.app_id ?? null

    const {
        shouldShowOrderManagementScreensRevamp,
        shouldShowFlowsScreensRevamp,
    } = useShouldShowChatSettingsRevamp(selected, selectedChannelId)

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const previewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelectorWithSync
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, chatChannels])

    const {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        ...chatPreviewPanelControls
    } = useChatPreviewPanel({
        headerActions: previewPanelHeaderActions,
        locale: selectedChannelLanguage,
    })

    const { onChatPreviewLoaded, updateSSPTexts } = chatPreviewPanelControls

    useEffect(() => {
        if (
            (shouldShowFlowsScreensRevamp && !!isChannelsRoute) ||
            shouldShowOrderManagementScreensRevamp
        ) {
            showPreviewPanel(appId)
        } else {
            hidePreviewPanel()
        }

        return hidePreviewPanel
    }, [
        shouldShowFlowsScreensRevamp,
        showPreviewPanel,
        hidePreviewPanel,
        appId,
        isChannelsRoute,
        shouldShowOrderManagementScreensRevamp,
    ])

    useEffect(() => {
        const sspTexts =
            GORGIAS_CHAT_SSP_TEXTS[
                selectedChannelLanguage ?? GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ] ?? GORGIAS_CHAT_SSP_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]

        return onChatPreviewLoaded(() => {
            updateSSPTexts(sspTexts)
        }, true)
    }, [selectedChannelLanguage, onChatPreviewLoaded, updateSSPTexts])

    return (
        <ChatPreviewChannelsContext.Provider
            value={{ selectedChannelId, setSelectedChannelId, shopName }}
        >
            <ChatPreviewPanelContext.Provider
                value={{ ...chatPreviewPanelControls }}
            >
                <div className={css.container}>
                    {shouldShowOrderManagementScreensRevamp ? (
                        !isOnRevampFlowPage && <OrderManagementSettingsHeader />
                    ) : (
                        <OrderManagementSettingsLegacyHeader />
                    )}

                    {!!selected && !!selectedPath && (
                        <OrderManagementPreviewProvider>
                            <Switch>
                                <Route exact path={path}>
                                    <OrderManagementViewContainer />
                                </Route>
                                <Route
                                    path={`${path}/track`}
                                    component={OrderManagementTrackRoute}
                                />
                                <Route
                                    path={`${path}/return`}
                                    component={OrderManagementReturnRoute}
                                />
                                <Route
                                    path={`${path}/cancel`}
                                    component={OrderManagementCancelRoute}
                                />
                                <Route
                                    path={`${path}/report-issue`}
                                    exact
                                    component={OrderManagementReportRoute}
                                />
                                <Route
                                    path={`${path}/report-issue/new`}
                                    exact
                                    component={
                                        OrderManagementReportNewScenarioRoute
                                    }
                                />
                                <Route
                                    path={`${path}/report-issue/:scenarioIndex`}
                                    exact
                                    component={OrderManagementReportEditRoute}
                                />
                                <Route path={`${path}/channels`}>
                                    <AutomateSettingsChannelsRoute />
                                </Route>
                            </Switch>
                            {chatPreviewPortal}
                        </OrderManagementPreviewProvider>
                    )}
                </div>
            </ChatPreviewPanelContext.Provider>
        </ChatPreviewChannelsContext.Provider>
    )
}
