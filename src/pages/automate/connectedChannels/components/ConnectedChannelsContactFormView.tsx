import React, {useCallback} from 'react'
import {useParams} from 'react-router-dom'
import classNames from 'classnames'
import {noop} from 'lodash'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import Spinner from 'pages/common/components/Spinner'
import {SegmentEvent, logEvent} from 'common/segment'

import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import {ContactForm} from 'models/contactForm/types'
import {AutomateFeatures} from 'pages/automate/common/types'
import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import {FlowsSettings} from './FlowsSettings'
import css from './ConnectedChannelsChatView.less'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'
import {FeatureSettings} from './FeatureSettings'
import {ConnectedChannelsEmptyView} from './ConnectedChannelsEmptyView'

interface Props {
    contactForm?: ContactForm
    hideDropdown?: boolean
}

export const ConnectedChannelsContactFormView = ({
    contactForm,
    hideDropdown,
}: Props) => {
    const {shopType: shopTypeParam, shopName: shopNameParam} = useParams<{
        shopType: string
        shopName: string
    }>()

    const shopType = contactForm ? 'shopify' : shopTypeParam
    const shopName = contactForm ? contactForm.shop_name ?? '' : shopNameParam

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const {data: workflowConfigurations = []} = useGetWorkflowConfigurations()

    const contactFormChannels = useSelfServiceStandaloneContactFormChannels(
        shopType,
        shopName
    )

    const [selectedChannel, setSelectedChannel] = React.useState<number | null>(
        () => contactFormChannels[0]?.value.id ?? null
    )

    const currentChannel =
        contactFormChannels.find(
            (channel) => channel.value.id === selectedChannel
        ) ?? contactFormChannels?.[0]

    const currentChannelId = currentChannel?.value.id ?? ''

    const {
        automationSettings,
        handleContactFormAutomationSettingsUpdate,
        isFetchPending,
    } = useContactFormAutomationSettings(currentChannelId)

    const updateSettings = useCallback(
        (value: boolean) => {
            void handleContactFormAutomationSettingsUpdate(
                {
                    ...automationSettings,
                    order_management: {
                        enabled: value,
                    },
                },
                `Order Management ${value ? 'enabled' : 'disabled'}`
            )
        },
        [automationSettings, handleContactFormAutomationSettingsUpdate]
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
                <Spinner color="dark" className={css.spinner} />
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
                        channels={contactFormChannels}
                        appId={currentChannel.value.id}
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
                                channel: 'Contact Form',
                            }
                        )

                        void handleContactFormAutomationSettingsUpdate(
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
