import classNames from 'classnames'
import {noop} from 'lodash'
import React, {useCallback} from 'react'
import {useParams} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {useUpdateHelpCenter} from 'models/helpCenter/queries'
import {HelpCenter} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/types'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import {AutomateFeatures} from 'pages/automate/common/types'
import Spinner from 'pages/common/components/Spinner'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import css from './ConnectedChannelsChatView.less'
import {ConnectedChannelsEmptyView} from './ConnectedChannelsEmptyView'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'
import {FeatureSettings} from './FeatureSettings'
import {FlowsSettings} from './FlowsSettings'

interface Props {
    helpCenter?: HelpCenter
    hideDropdown?: boolean
}
export const ConnectedChannelsHelpCenterView = ({
    helpCenter,
    hideDropdown,
}: Props) => {
    const {shopType: shopTypeParam, shopName: shopNameParam} = useParams<{
        shopType: string
        shopName: string
    }>()

    const shopType = helpCenter ? 'shopify' : shopTypeParam
    const shopName = helpCenter ? (helpCenter.shop_name ?? '') : shopNameParam

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
        () =>
            helpCenter
                ? helpCenter.id
                : (helpCenterChannels[0]?.value.id ?? null)
    )

    const currentChannel =
        helpCenterChannels.find(
            (channel) => channel.value.id === selectedChannel
        ) ?? helpCenterChannels?.[0]

    const currentChannelId = currentChannel?.value.id ?? ''

    const dispatch = useAppDispatch()

    const {
        automationSettings,
        handleHelpCenterAutomationSettingsUpdate,
        isFetchPending,
    } = useHelpCentersAutomationSettings(currentChannelId)
    const {mutateAsync: updateHelpCenterMutateAsync} = useUpdateHelpCenter()

    const updateOrderManagement = useCallback(
        async (value: boolean) => {
            try {
                const res = await updateHelpCenterMutateAsync([
                    undefined,
                    {help_center_id: currentChannelId},
                    {
                        self_service_deactivated: !value,
                    },
                ])

                dispatch(helpCenterUpdated(res!.data))

                void dispatch(
                    notify({
                        message: `Order Management ${
                            value ? 'enabled' : 'disabled'
                        }`,
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: `Failed to ${
                            value ? 'enable' : 'disable'
                        } Order Management`,
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [updateHelpCenterMutateAsync, dispatch, currentChannelId]
    )

    const isOrderManagementEnabled =
        !currentChannel?.value?.self_service_deactivated_datetime

    if (helpCenterChannels.length === 0) {
        return (
            <ConnectedChannelsEmptyView
                view={AutomateFeatures.AutomateHelpCenter}
            />
        )
    }

    const isLoading =
        !selfServiceConfiguration ||
        isSelfServiceConfigurationFetchPending ||
        isFetchPending ||
        !automationSettings

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <Spinner size="big" />
            </div>
        )
    }

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                {!hideDropdown && (
                    /* If help center is provided, it means we are in the help center context, so we don't need to show the dropdown */
                    <CurrentlyViewingDropdown
                        onConnect={noop}
                        appId={currentChannel.value.id}
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
                )}

                <FlowsSettings
                    channelType="help-center"
                    channel={currentChannel}
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
                    onChange={(nextEntrypoints, action) => {
                        const readableAction =
                            action === 'add'
                                ? 'added'
                                : action === 'remove'
                                  ? 'removed'
                                  : 'order updated'

                        logEvent(
                            SegmentEvent.AutomateChannelUpdateFromChannels,
                            {
                                page: 'Channels',
                            }
                        )

                        void handleHelpCenterAutomationSettingsUpdate(
                            {
                                ...automationSettings,
                                workflows: nextEntrypoints.map(
                                    (entrypoint) => ({
                                        id: entrypoint.workflow_id,
                                        enabled: entrypoint.enabled,
                                    })
                                ),
                            },
                            `${
                                action === 'reorder' ? 'Flows' : 'Flow'
                            } ${readableAction}`
                        )
                    }}
                />

                {shopType === IntegrationType.Shopify && (
                    <FeatureSettings
                        title="Order Management"
                        label="Enable Order Management"
                        labelSubtitle="Allow customers to track and manage their orders directly within your Help Center."
                        enabled={isOrderManagementEnabled}
                        externalLinkUrl={`/app/automation/${shopType}/${shopName}/order-management`}
                        onToggle={updateOrderManagement}
                    />
                )}
            </div>

            {selfServiceConfiguration && (
                <ConnectedChannelsPreview
                    channel={currentChannel}
                    selfServiceConfiguration={selfServiceConfiguration}
                    storeIntegration={storeIntegration}
                    contentContainerClassName={css.previewContentContainer}
                />
            )}
        </div>
    )
}
