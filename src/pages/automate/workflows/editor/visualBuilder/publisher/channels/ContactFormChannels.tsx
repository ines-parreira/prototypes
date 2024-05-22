import React, {useCallback} from 'react'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import {TicketChannel} from 'business/types/ticket'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    channel,
    onlySupportedChannels,
    configuration,
}: {
    configuration: WorkflowConfiguration
    channel: SelfServiceStandaloneContactFormChannel
    onlySupportedChannels: SelfServiceChannelType[]
}) => {
    const {
        automationSettings,
        isUpdatePending,
        isFetchPending,
        handleContactFormAutomationSettingsUpdate,
    } = useContactFormAutomationSettings(channel.value.id)
    const workflows = automationSettings?.workflows || []

    const handleUpdate = useCallback(
        (workflows) => {
            void handleContactFormAutomationSettingsUpdate({
                ...automationSettings,
                workflows,
            })
        },
        [automationSettings, handleContactFormAutomationSettingsUpdate]
    )
    return (
        <ChannelToggle
            configuration={configuration}
            onlySupportedChannels={onlySupportedChannels}
            channel={channel}
            isLoading={isUpdatePending || isFetchPending}
            workflows={workflows}
            handleAutomationSettingUpdate={handleUpdate}
        />
    )
}

const ContactFormChannels = ({
    configuration,
    standaloneContactFormsChannels,
}: {
    configuration: WorkflowConfiguration
    standaloneContactFormsChannels: SelfServiceStandaloneContactFormChannel[]
}) => {
    const onlySupportedChannels = useOnlySupportedChannels(
        configuration,
        TicketChannel.ContactForm
    )
    return (
        <ChannelBlock channelType={TicketChannel.ContactForm}>
            {standaloneContactFormsChannels.map((channel) => (
                <ChannelItem
                    configuration={configuration}
                    onlySupportedChannels={onlySupportedChannels}
                    channel={channel}
                    key={channel.value.id}
                />
            ))}
        </ChannelBlock>
    )
}
export default ContactFormChannels
