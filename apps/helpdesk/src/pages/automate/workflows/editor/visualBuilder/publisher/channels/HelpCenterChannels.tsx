import React, { useCallback, useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { HelpCenterAutomationSettings } from 'models/helpCenter/types'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    channel,
    onlySupportedChannels,
    configuration,
    isLoading,
    applicationAutomationSettings,
    handleHelpCenterAutomationSettingsUpdate,
}: {
    configuration: WorkflowConfiguration
    channel: SelfServiceHelpCenterChannel
    onlySupportedChannels: SelfServiceChannelType[]
    isLoading: boolean
    applicationAutomationSettings: HelpCenterAutomationSettings
    handleHelpCenterAutomationSettingsUpdate: (
        helpCenterId: number,
        chatApplicationAutomationSettings: Partial<HelpCenterAutomationSettings>,
    ) => Promise<void>
}) => {
    const workflows = applicationAutomationSettings?.workflows || []

    const handleHCUpdate = useCallback(
        // TODO(React18): workflows is typed as any[], but we need a typed array
        (workflows: any[]) => {
            void handleHelpCenterAutomationSettingsUpdate(channel.value.id, {
                ...applicationAutomationSettings,
                workflows,
            })
        },
        [
            applicationAutomationSettings,
            channel.value.id,
            handleHelpCenterAutomationSettingsUpdate,
        ],
    )
    return (
        <ChannelToggle
            configuration={configuration}
            onlySupportedChannels={onlySupportedChannels}
            channel={channel}
            isLoading={isLoading}
            workflows={workflows}
            handleAutomationSettingUpdate={handleHCUpdate}
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
        TicketChannel.HelpCenter,
    )
    const appIds = useMemo(() => {
        return helpCentersChannels.map((channel) => channel.value.id)
    }, [helpCentersChannels])

    const {
        helpCentersAutomationSettings,
        isUpdatePending,
        isFetchPending,
        handleHelpCenterAutomationSettingsUpdate,
    } = useHelpCentersAutomationSettings(appIds)
    return (
        <ChannelBlock channelType={TicketChannel.HelpCenter}>
            {helpCentersChannels.map((channel) => (
                <ChannelItem
                    configuration={configuration}
                    onlySupportedChannels={onlySupportedChannels}
                    channel={channel}
                    key={channel.value.id}
                    applicationAutomationSettings={
                        helpCentersAutomationSettings[channel.value.id]
                    }
                    isLoading={isUpdatePending || isFetchPending}
                    handleHelpCenterAutomationSettingsUpdate={
                        handleHelpCenterAutomationSettingsUpdate
                    }
                />
            ))}
        </ChannelBlock>
    )
}
export default HelpCenterChannels
