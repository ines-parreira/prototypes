import { useEffect, useMemo, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import { IntegrationType } from 'models/integration/constants'
import { useHistoryTracking } from 'pages/automate/common/hooks/useHistoryTracking'
import useSelfServiceChannels, {
    isSelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { ConnectedChannelsContextType } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import ConnectedChannelsContext from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { ChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChannelSelector/ChannelSelector'
import { OrderManagementViewContainer } from 'pages/automate/orderManagement/OrderManagementViewContainer'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
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

export const BASE_PATH = '/app/settings/order-management'

export function OrderManagementSettings() {
    const { shopName } = useParams<{
        shopName: string
        shopType: string
    }>()
    useHistoryTracking(SegmentEvent.AutomateOrderManagementVisited)

    const { path } = useRouteMatch()
    const isChannelsRoute = !!useRouteMatch(`${path}/channels`)
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

    const channels = useSelfServiceChannels(IntegrationType.Shopify, shopName)

    const [channel, setChannel] = useState<SelfServiceChannel | undefined>(
        channels.at(0),
    )

    const selectedChannelLanguage = useMemo(() => {
        if (channel?.type === TicketChannel.Chat) {
            return channel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language
        }
    }, [channel])

    const appId = useMemo(() => {
        if (channel?.type === TicketChannel.Chat) {
            return channel?.value.meta.app_id ?? null
        }

        return null
    }, [channel])

    const {
        shouldShowOrderManagementScreensRevamp,
        shouldShowFlowsScreensRevamp,
    } = useShouldShowChatSettingsRevamp(selected, channel?.value.id)

    const orderManagementPreviewContextValue =
        useMemo<ConnectedChannelsContextType>(
            () => ({
                channels,
                channel,
                onChannelChange: setChannel,
            }),
            [channels, channel, setChannel],
        )

    const selectableChannels = useMemo(() => {
        if (isChannelsRoute) {
            return channels.filter((c): c is SelfServiceChatChannel =>
                isSelfServiceChatChannel(c),
            )
        }
        return channels
    }, [channels, isChannelsRoute])

    const selectedChannel = useMemo(() => {
        return channel ?? channels.at(0)
    }, [channel, channels])

    useEffect(() => {
        if (isChannelsRoute) {
            if (selectedChannel?.type !== TicketChannel.Chat) {
                setChannel(channels.find((c) => c.type === TicketChannel.Chat))
            }
        }
    }, [selectedChannel, channels, isChannelsRoute])

    useEffect(() => {
        const firstChannel = channels.at(0)
        if (!channel && firstChannel) {
            setChannel(firstChannel)
        }
    }, [channel, channels])

    const headerActionsComponent = useMemo(() => {
        if (!selectedChannel) return undefined
        return (
            <ChannelSelector
                channels={selectableChannels}
                selectedChannel={selectedChannel}
                onSelect={setChannel}
            />
        )
    }, [selectableChannels, setChannel, selectedChannel])

    const {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        ...chatPreviewPanelControls
    } = useChatPreviewPanel({
        headerActions: headerActionsComponent,
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
        <ChatPreviewPanelContext.Provider value={chatPreviewPanelControls}>
            <div className={css.container}>
                {shouldShowOrderManagementScreensRevamp ? (
                    !isOnRevampFlowPage && <OrderManagementSettingsHeader />
                ) : (
                    <OrderManagementSettingsLegacyHeader />
                )}

                {!!selected && !!selectedPath && (
                    <ConnectedChannelsContext.Provider
                        value={orderManagementPreviewContextValue}
                    >
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
                    </ConnectedChannelsContext.Provider>
                )}
            </div>
        </ChatPreviewPanelContext.Provider>
    )
}
