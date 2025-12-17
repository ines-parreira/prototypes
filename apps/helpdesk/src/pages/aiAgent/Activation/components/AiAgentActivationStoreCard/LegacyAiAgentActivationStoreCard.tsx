import React, { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import cn from 'classnames'
import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentActivationStoreCardAlert } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCardAlert'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetAlreadyUsedEmailIntegrationIds } from 'pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import CheckBox from 'pages/common/forms/CheckBox'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import css from './LegacyAiAgentActivationStoreCard.less'

type Props = {
    store: StoreActivation
    onSalesChange: (newValue: boolean) => void
    onSupportChange: (newValue: boolean) => void
    onSupportChatChange: (newValue: boolean) => void
    onSupportEmailChange: (newValue: boolean) => void
    isDisabled?: boolean
    closeModal: () => void
}
export const LegacyAiAgentActivationStoreCard = ({
    store: { name, title, support, sales, alerts, configuration },
    onSalesChange,
    onSupportChange,
    onSupportChatChange,
    onSupportEmailChange,
    isDisabled,
    closeModal,
}: Props) => {
    const enablementList = [
        sales.enabled,
        support.chat.enabled,
        support.email.enabled,
    ]
    const enablement = {
        current: enablementList.filter(Boolean).length,
        total: enablementList.length,
    }

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
    const alreadyUsedEmailIntegrationIds = useGetAlreadyUsedEmailIntegrationIds(
        configuration.storeName,
    )
    const emailItems = useMemo(() => {
        return emailIntegrations
            .map((integration) => ({
                email: integration.meta.address,
                id: integration.id,
                isDefault: integration.meta.preferred,
                isDisabled: alreadyUsedEmailIntegrationIds.includes(
                    integration.id,
                ),
            }))
            .filter((item) => item.isDisabled === false)
    }, [emailIntegrations, alreadyUsedEmailIntegrationIds])
    const selectedEmails = useMemo(() => {
        return emailItems.filter((emailItem) =>
            configuration.monitoredEmailIntegrations.some(
                (emailIntegration) => emailIntegration.id === emailItem.id,
            ),
        )
    }, [emailItems, configuration.monitoredEmailIntegrations])

    const { routes } = useAiAgentNavigation({ shopName: name })

    const isDisabledCore = isDisabled || (alerts ?? []).length > 0

    const aiSalesEmailEnabled = useFlag(
        FeatureFlagKey.AiSalesAgentActivationEmailSettings,
    )

    const salesBlockCopy = aiSalesEmailEnabled
        ? 'Shopping Assistant can only be activated on the channel where Support Agent is activated.'
        : 'Shopping Assistant can only be activated when Support Agent for Chat is activated.'

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{title}</div>
                    <div className={css.enablement}>
                        {enablement.current} of {enablement.total}
                    </div>
                </div>

                <AiAgentActivationStoreCardAlert
                    alerts={alerts}
                    closeModal={closeModal}
                />
            </div>

            <div className={cn(css.section, css.skillSection)}>
                <div>
                    <div className={css.heading}>
                        <div className={css.title}>Support Agent</div>
                        <NewToggleButton
                            isDisabled={
                                isDisabledCore ||
                                ((support.chat.isIntegrationMissing ||
                                    support.chat.isInstallationMissing) &&
                                    support.email.isIntegrationMissing)
                            }
                            checked={support.enabled}
                            onChange={onSupportChange}
                        />
                    </div>

                    <div className={css.channelsList}>
                        <div className={css.channel}>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    isDisabled={
                                        isDisabledCore ||
                                        !!support.chat.isIntegrationMissing ||
                                        !!support.chat.isInstallationMissing
                                    }
                                    isChecked={support.chat.enabled}
                                    onChange={onSupportChatChange}
                                >
                                    Chat
                                    {!!support.chat.isIntegrationMissing && (
                                        <>
                                            <img
                                                id="support__chat__icon"
                                                className={css.warningIcon}
                                                alt="warning"
                                                src={warningIcon}
                                            />
                                            <Tooltip target="support__chat__icon">
                                                A chat integration must be
                                                selected for this store.
                                            </Tooltip>
                                        </>
                                    )}
                                    {!!support.chat.isInstallationMissing && (
                                        <>
                                            <img
                                                id="support__chat__icon"
                                                className={css.warningIcon}
                                                alt="warning"
                                                src={warningIcon}
                                            />
                                            <Tooltip target="support__chat__icon">
                                                A chat integration must be
                                                installed for this store.
                                            </Tooltip>
                                        </>
                                    )}
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                {!!support.chat.isIntegrationMissing && (
                                    <Link
                                        to={routes.deployChat}
                                        onClick={closeModal}
                                    >
                                        Select Integration for Chat
                                    </Link>
                                )}
                                {!!support.chat.isInstallationMissing && (
                                    <Link
                                        to={`/app/settings/channels/gorgias_chat/${support.chat.availableChats?.at(0)}/installation`}
                                        onClick={closeModal}
                                    >
                                        Install Chat
                                    </Link>
                                )}
                                {!support.chat.isIntegrationMissing &&
                                    !support.chat.isInstallationMissing && (
                                        <div className={css.labelContainer}>
                                            <span>
                                                Activate Support for integrated
                                                chats.
                                            </span>
                                            {selectedChats.length > 0 && (
                                                <IconTooltip
                                                    className={css.icon}
                                                    tooltipProps={{
                                                        placement: 'top-start',
                                                    }}
                                                >
                                                    integrated chats:
                                                    <div>
                                                        {selectedChats.map(
                                                            (channel) => (
                                                                <div
                                                                    key={
                                                                        channel
                                                                            .value
                                                                            .id
                                                                    }
                                                                >
                                                                    {
                                                                        channel
                                                                            .value
                                                                            .name
                                                                    }
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </IconTooltip>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    isDisabled={
                                        isDisabledCore ||
                                        support.email.isIntegrationMissing
                                    }
                                    isChecked={support.email.enabled}
                                    onChange={onSupportEmailChange}
                                >
                                    Email
                                    {!!support.email.isIntegrationMissing && (
                                        <>
                                            <img
                                                id="support__email__icon"
                                                className={css.warningIcon}
                                                alt="warning"
                                                src={warningIcon}
                                            />
                                            <Tooltip target="support__email__icon">
                                                An email integration must be
                                                selected for this store.
                                            </Tooltip>
                                        </>
                                    )}
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                {support.email.isIntegrationMissing ? (
                                    <Link
                                        to={routes.deployEmail}
                                        onClick={closeModal}
                                    >
                                        Select Integration for Email
                                    </Link>
                                ) : (
                                    <div className={css.labelContainer}>
                                        <span>
                                            Activate Support for integrated
                                            emails.
                                        </span>
                                        {selectedEmails.length > 0 && (
                                            <IconTooltip
                                                className={css.icon}
                                                tooltipProps={{
                                                    placement: 'top-start',
                                                }}
                                            >
                                                integrated emails:
                                                <div>
                                                    {selectedEmails.map(
                                                        (channel) => (
                                                            <div
                                                                key={channel.id}
                                                            >
                                                                {channel.email}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </IconTooltip>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={cn(css.skillSales, {
                        [css.disabled]: sales.isDisabled,
                    })}
                >
                    <div className={css.heading}>
                        <div className={css.title}>Shopping Assistant</div>
                        <NewToggleButton
                            isDisabled={isDisabledCore || sales.isDisabled}
                            checked={sales.enabled}
                            onChange={onSalesChange}
                        />
                    </div>
                    <div className={css.description}>{salesBlockCopy}</div>
                </div>
            </div>
        </div>
    )
}
