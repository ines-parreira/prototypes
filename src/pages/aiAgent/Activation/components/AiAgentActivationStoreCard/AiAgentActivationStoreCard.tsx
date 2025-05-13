import React, { useMemo } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentActivationStoreCardAlert } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCardAlert'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetUsedEmailIntegrations } from 'pages/aiAgent/hooks/useGetUsedEmailIntegrations'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import css from './AiAgentActivationStoreCard.less'

type Props = {
    store: StoreActivation
    onChatChange: (newValue: boolean) => void
    onEmailChange: (newValue: boolean) => void
    isDisabled?: boolean
    closeModal: () => void
}

export const AiAgentActivationStoreCard = ({
    store: { name, title, support, alerts, configuration },
    onChatChange,
    onEmailChange,
    isDisabled,
    closeModal,
}: Props) => {
    const chatChannels = useSelfServiceChatChannels(
        configuration.shopType,
        configuration.storeName,
    )
    const selectedChats = useMemo(() => {
        return chatChannels.filter((chatChannel) =>
            configuration.monitoredChatIntegrations.includes(
                chatChannel.value.id,
            ),
        )
    }, [chatChannels, configuration.monitoredChatIntegrations])

    const getIntegrationsByEmail = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        [],
    )
    const emailIntegrations = useAppSelector(getIntegrationsByEmail)
    const usedEmailIntegrations = useGetUsedEmailIntegrations(
        configuration.storeName,
    )
    const emailItems = useMemo(() => {
        return emailIntegrations
            .map((integration) => ({
                email: integration.meta.address,
                id: integration.id,
                isDefault: integration.meta.preferred,
                isDisabled: usedEmailIntegrations.includes(integration.id),
            }))
            .filter((item) => item.isDisabled === false)
    }, [emailIntegrations, usedEmailIntegrations])
    const selectedEmails = useMemo(() => {
        return emailItems.filter((emailItem) =>
            configuration.monitoredEmailIntegrations.some(
                (emailIntegration) => emailIntegration.id === emailItem.id,
            ),
        )
    }, [emailItems, configuration.monitoredEmailIntegrations])

    const { routes } = useAiAgentNavigation({ shopName: name })

    const isDisabledCore = isDisabled || (alerts ?? []).length > 0

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{title}</div>
                </div>

                <AiAgentActivationStoreCardAlert
                    alerts={alerts}
                    closeModal={closeModal}
                />
            </div>

            <div className={cn(css.section, css.skillSection)}>
                <div>
                    <div className={css.heading}>
                        Enable Channels for AI Agent
                    </div>

                    <div className={css.channelsList}>
                        <ChannelToggle
                            label="Chat"
                            checked={support.chat.enabled}
                            disabled={
                                isDisabledCore ||
                                !!support.chat.isIntegrationMissing ||
                                !!support.chat.isInstallationMissing
                            }
                            onChange={onChatChange}
                            warnings={[
                                {
                                    visible:
                                        !!support.chat.isIntegrationMissing,
                                    hint: 'A chat integration must be selected for this store.',
                                    action: (
                                        <Link
                                            to={routes.settingsChannels}
                                            onClick={closeModal}
                                        >
                                            <span>
                                                Select Integration for Chat
                                            </span>
                                            <i
                                                className={`${css.warningLinkIcon} material-icons`}
                                            >
                                                open_in_new
                                            </i>
                                        </Link>
                                    ),
                                },
                                {
                                    visible:
                                        !!support.chat.isInstallationMissing,
                                    hint: 'A chat integration must be installed for this store.',
                                    action: (
                                        <Link
                                            to={`/app/settings/channels/gorgias_chat/${support.chat.availableChats?.at(0)}/installation`}
                                            onClick={closeModal}
                                        >
                                            <span>Install Chat</span>
                                            <i
                                                className={`${css.warningLinkIcon} material-icons`}
                                            >
                                                open_in_new
                                            </i>
                                        </Link>
                                    ),
                                },
                            ]}
                            tooltip={{
                                visible: selectedChats.length > 0,
                                content: (
                                    <>
                                        integrated chats:
                                        <div>
                                            {selectedChats.map((channel) => (
                                                <div key={channel.value.id}>
                                                    {channel.value.name}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ),
                            }}
                        />

                        <ChannelToggle
                            label="Email"
                            checked={support.email.enabled}
                            disabled={
                                isDisabledCore ||
                                !!support.email.isIntegrationMissing
                            }
                            onChange={onEmailChange}
                            warnings={[
                                {
                                    visible:
                                        !!support.email.isIntegrationMissing,
                                    hint: 'An email integration must be selected for this store.',
                                    action: (
                                        <Link
                                            to={routes.settingsChannels}
                                            onClick={closeModal}
                                        >
                                            <span>
                                                Select Integration for Email
                                            </span>
                                            <i
                                                className={`${css.warningLinkIcon} material-icons`}
                                            >
                                                open_in_new
                                            </i>
                                        </Link>
                                    ),
                                },
                            ]}
                            tooltip={{
                                visible: selectedEmails.length > 0,
                                content: (
                                    <>
                                        integrated emails:
                                        <div>
                                            {selectedEmails.map((channel) => (
                                                <div key={channel.id}>
                                                    {channel.email}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
