import React, {useCallback} from 'react'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import {SelfServiceHelpCenterChannel} from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
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
    channel: SelfServiceHelpCenterChannel
    onlySupportedChannels: SelfServiceChannelType[]
}) => {
    const {
        automationSettings,
        isUpdatePending,
        isFetchPending,
        handleHelpCenterAutomationSettingsUpdate,
    } = useHelpCentersAutomationSettings(channel.value.id)
    const workflows = automationSettings?.workflows || []

    const handleUpdate = useCallback(
        (workflows) => {
            void handleHelpCenterAutomationSettingsUpdate({
                ...automationSettings,
                workflows,
            })
        },
        [automationSettings, handleHelpCenterAutomationSettingsUpdate]
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

const HelpCenterChannels = ({
    helpCentersChannels,
    configuration,
}: {
    helpCentersChannels: SelfServiceHelpCenterChannel[]
    configuration: WorkflowConfiguration
}) => {
    const onlySupportedChannels = useOnlySupportedChannels(
        configuration,
        TicketChannel.HelpCenter
    )
    return (
        <ChannelBlock channelType={TicketChannel.HelpCenter}>
            {helpCentersChannels.map((channel) => (
                <ChannelItem
                    configuration={configuration}
                    onlySupportedChannels={onlySupportedChannels}
                    key={channel.value.id}
                    channel={channel}
                />
            ))}
        </ChannelBlock>
    )
}
export default HelpCenterChannels
