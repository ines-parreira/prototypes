import React, {useCallback, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import classNames from 'classnames'
import {noop} from 'lodash'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import Spinner from 'pages/common/components/Spinner'
import {SegmentEvent, logEvent} from 'common/segment'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import {FlowsSettings} from './FlowsSettings'
import css from './ConnectedChannelsChatView.less'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'
import {FeatureSettings} from './FeatureSettings'

export const ConnectedChannelsHelpCenterView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const {data: workflowConfigurations = []} = useGetWorkflowConfigurations()

    const helpCenterChannels = useSelfServiceHelpCenterChannels(
        shopType,
        shopName
    )

    const [selectedChannel, setSelectedChannel] = React.useState<number | null>(
        () => helpCenterChannels[0]?.value.id ?? null
    )

    const currentChannel =
        helpCenterChannels.find(
            (channel) => channel.value.id === selectedChannel
        ) ?? helpCenterChannels?.[0]

    const currentChannelId = currentChannel?.value.id ?? ''

    const {
        automationSettings,
        handleHelpCenterAutomationSettingsUpdate,
        isFetchPending,
    } = useHelpCentersAutomationSettings(currentChannelId)

    const updateSettings = useCallback(
        () => (value: boolean) => {
            void handleHelpCenterAutomationSettingsUpdate({
                ...automationSettings,
                order_management: {
                    enabled: value,
                },
            })
        },
        [automationSettings, handleHelpCenterAutomationSettingsUpdate]
    )

    const isOrderManagementEnabled = useMemo(() => {
        return automationSettings.order_management?.enabled ?? false
    }, [automationSettings])

    const isLoading =
        !selfServiceConfiguration ||
        isSelfServiceConfigurationFetchPending ||
        isFetchPending ||
        !automationSettings

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <Spinner color="dark" className={css.spinner} />
            </div>
        )
    }

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                <CurrentlyViewingDropdown
                    onConnect={noop}
                    channelType="help-center"
                    channels={helpCenterChannels}
                    value={selectedChannel ?? ''}
                    label={currentChannel?.value?.name}
                    onSelectedChannelChange={(value) =>
                        setSelectedChannel(Number(value))
                    }
                    renderOption={(channel) => ({
                        label: channel.value.name,
                        value: channel.value.id ?? channel.value.name,
                    })}
                />

                <FlowsSettings
                    channelType="help-center"
                    shopType={shopType}
                    shopName={shopName}
                    workflowEntrypoints={
                        selfServiceConfiguration?.workflowsEntrypoints
                    }
                    primaryLanguage={
                        currentChannel?.value.default_locale ?? 'en-US'
                    }
                    configurations={workflowConfigurations ?? []}
                    automationSettingsWorkflows={automationSettings.workflows.map(
                        (workflow) => ({
                            workflow_id: workflow.id,
                            enabled: workflow.enabled,
                        })
                    )}
                    onChange={(nextEntrypoints) => {
                        logEvent(
                            SegmentEvent.AutomateChannelUpdateFromChannels,
                            {
                                page: 'Channels',
                            }
                        )

                        void handleHelpCenterAutomationSettingsUpdate({
                            ...automationSettings,
                            workflows: nextEntrypoints.map((entrypoint) => ({
                                id: entrypoint.workflow_id,
                                enabled: entrypoint.enabled,
                            })),
                        })
                    }}
                />

                <FeatureSettings
                    title="Order Management"
                    label="Enable Order Management"
                    labelSubtitle="Allow customers to track and manage their orders directly within your Chat."
                    enabled={isOrderManagementEnabled}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/order-management`}
                    onToggle={updateSettings()}
                />
            </div>

            {selfServiceConfiguration && (
                <ConnectedChannelsPreview
                    channel={currentChannel}
                    selfServiceConfiguration={selfServiceConfiguration}
                    storeIntegration={storeIntegration}
                />
            )}
        </div>
    )
}
