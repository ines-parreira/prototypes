import React, {useCallback, useMemo} from 'react'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import {TicketChannel} from 'business/types/ticket'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import {ContactFormAutomationSettings} from 'models/contactForm/types'
import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    channel,
    onlySupportedChannels,
    configuration,
    isLoading,
    applicationAutomationSettings,
    handleContactFormAutomationSettingsUpdate,
}: {
    configuration: WorkflowConfiguration
    channel: SelfServiceStandaloneContactFormChannel
    onlySupportedChannels: SelfServiceChannelType[]
    isLoading: boolean
    applicationAutomationSettings: ContactFormAutomationSettings
    handleContactFormAutomationSettingsUpdate: (
        contactFormId: number,
        chatApplicationAutomationSettings: Partial<ContactFormAutomationSettings>
    ) => Promise<void>
}) => {
    const workflows = applicationAutomationSettings?.workflows || []

    const handleCFUpdate = useCallback(
        (workflows) => {
            void handleContactFormAutomationSettingsUpdate(channel.value.id, {
                ...applicationAutomationSettings,
                workflows,
            })
        },
        [
            applicationAutomationSettings,
            channel.value.id,
            handleContactFormAutomationSettingsUpdate,
        ]
    )
    return (
        <ChannelToggle
            configuration={configuration}
            onlySupportedChannels={onlySupportedChannels}
            channel={channel}
            isLoading={isLoading}
            workflows={workflows}
            handleAutomationSettingUpdate={handleCFUpdate}
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
    const appIds = useMemo(() => {
        return standaloneContactFormsChannels.map((channel) => channel.value.id)
    }, [standaloneContactFormsChannels])
    const {
        contactFormsAutomationSettings,
        isUpdatePending,
        isFetchPending,
        handleContactFormAutomationSettingsUpdate,
    } = useContactFormsAutomationSettings(appIds)
    return (
        <ChannelBlock channelType={TicketChannel.ContactForm}>
            {standaloneContactFormsChannels.map((channel) => (
                <ChannelItem
                    configuration={configuration}
                    onlySupportedChannels={onlySupportedChannels}
                    channel={channel}
                    key={channel.value.id}
                    applicationAutomationSettings={
                        contactFormsAutomationSettings[channel.value.id]
                    }
                    isLoading={isUpdatePending || isFetchPending}
                    handleContactFormAutomationSettingsUpdate={
                        handleContactFormAutomationSettingsUpdate
                    }
                />
            ))}
        </ChannelBlock>
    )
}
export default ContactFormChannels
