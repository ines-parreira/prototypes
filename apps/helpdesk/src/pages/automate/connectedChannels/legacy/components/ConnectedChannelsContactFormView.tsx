/* istanbul ignore file */
import React, { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { noop } from 'lodash'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import { useSearchParam } from 'hooks/useSearchParam'
import type { ContactForm } from 'models/contactForm/types'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { SelfServiceStandaloneContactFormChannel } from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import { AutomateFeatures } from 'pages/automate/common/types'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'
import { CurrentlyViewingDropdown } from './CurrentlyViewingDropdown'
import { FeatureSettings } from './FeatureSettings'
import { FlowsSettings } from './FlowsSettings'

import css from './ConnectedChannelsChatView.less'

interface Props {
    contactForm?: ContactForm
    hideDropdown?: boolean
}

export const ConnectedChannelsContactFormView = ({
    contactForm,
    hideDropdown,
}: Props) => {
    const {
        contactFormId: contactFormIdParam,
        shopType: shopTypeParam,
        shopName: shopNameParam,
    } = useParams<{
        shopType: string
        shopName: string
        contactFormId: string
    }>()

    const [shopType, shopName] = useMemo(() => {
        if (contactForm?.shop_integration) {
            return [
                contactForm.shop_integration.shop_type,
                contactForm.shop_integration.shop_name,
            ]
        }

        return [shopTypeParam, shopNameParam]
    }, [contactForm, shopTypeParam, shopNameParam])

    const isAutomateSettings = useIsAutomateSettings()
    const location = useLocation()
    const history = useHistory()
    const [channelId] = useSearchParam('channel-id')

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const { data: workflowConfigurations = [] } = useGetWorkflowConfigurations()

    const channels = useSelfServiceChannels(shopType, shopName)

    const contactFormChannels = useMemo(() => {
        return channels.filter(
            (channel): channel is SelfServiceStandaloneContactFormChannel =>
                channel.type === TicketChannel.ContactForm,
        )
    }, [channels])

    const [selectedChannelId, setSelectedChannel] = React.useState<
        number | null
    >(
        () =>
            Number(channelId) ||
            Number(contactFormIdParam) ||
            (contactFormChannels[0]?.value.id ?? null),
    )

    const currentChannel =
        contactFormChannels.find(
            (channel) => channel.value.id === selectedChannelId,
        ) ?? contactFormChannels?.[0]

    const currentChannelId = currentChannel?.value.id ?? ''

    const {
        automationSettings,
        handleContactFormAutomationSettingsUpdate,
        isFetchPending,
    } = useContactFormAutomationSettings(currentChannelId)

    const currentlyViewingDropdownOptions = useMemo(
        () => (isAutomateSettings ? channels : contactFormChannels),
        [channels, contactFormChannels, isAutomateSettings],
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
                case TicketChannel.ContactForm:
                    setSelectedChannel(Number(value))
                    break
                case TicketChannel.HelpCenter:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels/help-center?channel-id=${value}`,
                    )
                    break
                case TicketChannel.Chat:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels?channel-id=${value}`,
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

    const updateSettings = useCallback(
        (value: boolean) => {
            void handleContactFormAutomationSettingsUpdate(
                {
                    ...automationSettings,
                    order_management: {
                        enabled: value,
                    },
                },
                `Order Management ${value ? 'enabled' : 'disabled'}`,
            )
        },
        [automationSettings, handleContactFormAutomationSettingsUpdate],
    )

    if (contactFormChannels.length === 0) {
        return (
            <ConnectedChannelsEmptyView
                view={AutomateFeatures.AutomateContactForm}
            />
        )
    }

    const isOrderManagementEnabled =
        automationSettings.order_management?.enabled

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
                    /* If contact form is provided, it means we are in the help center context, so we don't need to show the dropdown */
                    <CurrentlyViewingDropdown
                        onConnect={noop}
                        channelType="contact-form"
                        channels={currentlyViewingDropdownOptions}
                        appId={currentChannel.value.id}
                        value={selectedChannelId ?? ''}
                        label={currentChannel?.value?.name}
                        onSelectedChannelChange={onSelectedChannelChange}
                        renderOption={currentlyViewingDropdownRenderOption}
                    />
                )}

                <FlowsSettings
                    channelType="contact-form"
                    channel={currentChannel}
                    shopType={shopType}
                    shopName={shopName}
                    workflowEntrypoints={
                        selfServiceConfiguration?.workflowsEntrypoints
                    }
                    primaryLanguage={
                        currentChannel?.value.default_locale ?? 'en-US'
                    }
                    configurations={workflowConfigurations}
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
                                channel: 'Contact Form',
                            },
                        )

                        void handleContactFormAutomationSettingsUpdate(
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

                <FeatureSettings
                    title="Order Management"
                    label="Enable Order Management"
                    labelSubtitle="Allow customers to track and manage their orders directly within your Contact Form."
                    enabled={isOrderManagementEnabled}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/order-management`}
                    onToggle={updateSettings}
                />
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
