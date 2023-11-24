import React from 'react'
import {History} from 'history'

import {TicketChannel} from 'business/types/ticket'
import SelfServiceFeatureDisabledOnChannelAlert from 'pages/automate/common/components/preview/SelfServiceFeatureDisabledOnChannelAlert'
import SelfServicePreviewContext, {
    SelfServicePreviewContextType,
} from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automate/common/components/preview/SelfServicePreviewContainer'
import {
    PolicyKey,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'

import {useOrderManagementPreviewContext} from './OrderManagementPreviewContext'

type Props = {
    history: History
    hoveredOrderManagementFlow?: Maybe<PolicyKey>
    selfServiceConfiguration: SelfServiceConfiguration
}

const OrderManagementPreview = ({
    selfServiceConfiguration,
    hoveredOrderManagementFlow,
    history,
}: Props) => {
    const {channels, channel, onChannelChange} =
        useOrderManagementPreviewContext()
    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings
    )

    return (
        <SelfServicePreviewContainer
            channel={channel}
            onChange={onChannelChange}
            channels={channels}
            alert={{
                message:
                    'Connect a Chat or Help Center to your store to use this feature.',
            }}
        >
            {(channel) => {
                let isOrderManagementDisabled = true
                let workflowsEntrypoints: SelfServicePreviewContextType['workflowsEntrypoints']

                if (channel.type === TicketChannel.Chat) {
                    const applicationId = channel.value.meta.app_id!
                    const applicationAutomationSettings =
                        applicationsAutomationSettings[applicationId]
                    isOrderManagementDisabled =
                        applicationAutomationSettings?.orderManagement
                            .enabled === false
                    workflowsEntrypoints =
                        applicationAutomationSettings?.workflows.entrypoints
                } else if (channel.type === TicketChannel.HelpCenter) {
                    isOrderManagementDisabled = Boolean(
                        channel.value.self_service_deactivated_datetime
                    )
                }

                if (isOrderManagementDisabled) {
                    return (
                        <SelfServiceFeatureDisabledOnChannelAlert
                            shopName={selfServiceConfiguration.shop_name}
                            shopType={selfServiceConfiguration.type}
                        />
                    )
                }

                return (
                    <SelfServicePreviewContext.Provider
                        value={{
                            selfServiceConfiguration,
                            hoveredOrderManagementFlow,
                            orderManagementFlow: 'track_order_policy',
                            workflowsEntrypoints,
                        }}
                    >
                        <SelfServicePreview
                            channel={channel}
                            history={history}
                        />
                    </SelfServicePreviewContext.Provider>
                )
            }}
        </SelfServicePreviewContainer>
    )
}

export default OrderManagementPreview
