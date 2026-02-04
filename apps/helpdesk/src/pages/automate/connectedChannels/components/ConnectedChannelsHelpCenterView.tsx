import React, { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { noop } from 'lodash'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import { useSearchParam } from 'hooks/useSearchParam'
import { useUpdateHelpCenter } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/types'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import { AutomateFeatures } from 'pages/automate/common/types'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'
import { CurrentlyViewingDropdown } from './CurrentlyViewingDropdown'
import { FeatureSettings } from './FeatureSettings'
import { FlowsSettings } from './FlowsSettings'

import css from './ConnectedChannelsChatView.less'

interface Props {
    helpCenter?: HelpCenter
    hideDropdown?: boolean
}
export const ConnectedChannelsHelpCenterView = ({
    helpCenter,
    hideDropdown,
}: Props) => {
    const { shopType: shopTypeParam, shopName: shopNameParam } = useParams<{
        shopType: string
        shopName: string
    }>()
    const isAutomateSettings = useIsAutomateSettings()
    const location = useLocation()
    const history = useHistory()
    const [channelId] = useSearchParam('channel-id')

    const [shopType, shopName] = useMemo(() => {
        if (helpCenter?.shop_integration) {
            return [
                helpCenter.shop_integration.shop_type,
                helpCenter.shop_integration.shop_name,
            ]
        }

        return [
            helpCenter ? 'shopify' : shopTypeParam,
            helpCenter ? (helpCenter.shop_name ?? '') : shopNameParam,
        ]
    }, [helpCenter, shopTypeParam, shopNameParam])

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const { data: workflowConfigurations = [] } = useGetWorkflowConfigurations()

    const channels = useSelfServiceChannels(shopType, shopName)

    const helpCenterChannels = useMemo(() => {
        return channels.filter(
            (channel): channel is SelfServiceHelpCenterChannel =>
                channel.type === TicketChannel.HelpCenter,
        )
    }, [channels])

    const [selectedChannel, setSelectedChannel] = React.useState<number | null>(
        () =>
            helpCenter?.id
                ? helpCenter.id
                : channelId
                  ? Number(channelId)
                  : (helpCenterChannels[0]?.value.id ?? null),
    )

    const currentChannel =
        helpCenterChannels.find(
            (channel) => channel.value.id === selectedChannel,
        ) ?? helpCenterChannels?.[0]

    const currentChannelId = helpCenter?.id
        ? helpCenter.id
        : (currentChannel?.value.id ?? '')

    const dispatch = useAppDispatch()

    const {
        automationSettings,
        handleHelpCenterAutomationSettingsUpdate,
        isFetchPending,
    } = useHelpCentersAutomationSettings(currentChannelId)
    const { mutateAsync: updateHelpCenterMutateAsync } = useUpdateHelpCenter()

    const updateOrderManagement = useCallback(
        async (value: boolean) => {
            try {
                const res = await updateHelpCenterMutateAsync([
                    undefined,
                    { help_center_id: currentChannelId },
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
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        message: `Failed to ${
                            value ? 'enable' : 'disable'
                        } Order Management`,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [updateHelpCenterMutateAsync, dispatch, currentChannelId],
    )

    const currentlyViewingDropdownOptions = useMemo(
        () => (isAutomateSettings ? channels : helpCenterChannels),
        [channels, helpCenterChannels, isAutomateSettings],
    )

    const currentlyViewingDropdownRenderOption = useCallback(
        (channel: SelfServiceChannel) => {
            switch (channel.type) {
                case TicketChannel.Chat:
                    return {
                        label: channel.value.name,
                        value: channel.value.meta.app_id ?? channel.value.name,
                    }
                case TicketChannel.HelpCenter:
                    return {
                        label: channel.value.name,
                        value: channel.value.id ?? channel.value.name,
                    }
                default:
                    return {
                        label: channel.value.name,
                        value: channel.value.id ?? channel.value.name,
                    }
            }
        },
        [],
    )

    const isOrderManagementEnabled =
        !currentChannel?.value?.self_service_deactivated_datetime

    const onSelectedChannelChange = useCallback(
        (value: string | number) => {
            if (!isAutomateSettings) {
                setSelectedChannel(Number(value))
                return
            }

            const selectedChannel = channels.find((channel) => {
                if (channel.type === TicketChannel.Chat) {
                    return channel.value.meta?.app_id === value
                }
                return channel.value.id === value
            })

            if (!selectedChannel) return

            const [baseURL] = location.pathname.split(shopType)

            switch (selectedChannel.type) {
                // Current channel type, no redirect
                case TicketChannel.HelpCenter:
                    setSelectedChannel(Number(value))
                    break
                case TicketChannel.Chat:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels?channel-id=${value}`,
                    )
                    break
                case TicketChannel.ContactForm:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels/contact-form?channel-id=${value}`,
                    )
                    break
                default:
                    break
            }
        },
        [
            channels,
            history,
            shopName,
            shopType,
            location.pathname,
            isAutomateSettings,
        ],
    )

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
                <LoadingSpinner size="big" />
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
                        channels={currentlyViewingDropdownOptions}
                        value={selectedChannel ?? ''}
                        label={currentChannel?.value?.name}
                        onSelectedChannelChange={onSelectedChannelChange}
                        renderOption={currentlyViewingDropdownRenderOption}
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
                        }),
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
                            },
                        )

                        void handleHelpCenterAutomationSettingsUpdate(
                            {
                                ...automationSettings,
                                workflows: nextEntrypoints.map(
                                    (entrypoint) => ({
                                        id: entrypoint.workflow_id,
                                        enabled: entrypoint.enabled,
                                    }),
                                ),
                            },
                            `${
                                action === 'reorder' ? 'Flows' : 'Flow'
                            } ${readableAction}`,
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
