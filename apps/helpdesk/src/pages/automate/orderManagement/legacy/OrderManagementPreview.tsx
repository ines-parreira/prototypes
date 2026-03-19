import type { History } from 'history'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import type {
    PolicyKey,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import SelfServiceFeatureDisabledOnChannelAlert from 'pages/automate/common/components/preview/SelfServiceFeatureDisabledOnChannelAlert'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automate/common/components/preview/SelfServicePreviewContainer'
import type { SelfServicePreviewContextType } from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { getChatsApplicationAutomationSettings } from 'state/entities/chatsApplicationAutomationSettings/selectors'
import { getContactFormsAutomationSettings } from 'state/entities/contactForm/contactFormsAutomationSettings'

import { useOrderManagementPreviewContext } from './OrderManagementPreviewContext'

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
    const { channels, channel, onChannelChange } =
        useOrderManagementPreviewContext()
    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings,
    )
    const contactFormsAutomationSettings = useAppSelector(
        getContactFormsAutomationSettings,
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
                        channel.value.self_service_deactivated_datetime,
                    )
                } else if (channel.type === TicketChannel.ContactForm) {
                    const applicationAutomationSettings =
                        contactFormsAutomationSettings[channel.value.id]
                    isOrderManagementDisabled =
                        applicationAutomationSettings?.order_management
                            .enabled === false
                    workflowsEntrypoints =
                        applicationAutomationSettings?.workflows.map(
                            (workflow) => ({
                                ...workflow,
                                workflow_id: workflow.id,
                            }),
                        )
                }

                if (isOrderManagementDisabled) {
                    return (
                        <SelfServiceFeatureDisabledOnChannelAlert
                            shopName={selfServiceConfiguration.shopName}
                            shopType={selfServiceConfiguration.type}
                        />
                    )
                }

                return (
                    <SelfServicePreviewContext.Provider
                        value={{
                            selfServiceConfiguration,
                            hoveredOrderManagementFlow,
                            orderManagementFlow: 'trackOrderPolicy',
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
