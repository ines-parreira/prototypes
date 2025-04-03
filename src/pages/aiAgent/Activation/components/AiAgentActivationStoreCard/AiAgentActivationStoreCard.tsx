import { useMemo } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import warningIcon from 'assets/img/icons/warning.svg'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetUsedEmailIntegrations } from 'pages/aiAgent/hooks/useGetUsedEmailIntegrations'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import CheckBox from 'pages/common/forms/CheckBox'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import css from './AiAgentActivationStoreCard.less'

export type StoreActivation = {
    name: string
    title: string
    alerts: {
        kind: symbol
        type: AlertType
        message: string
        cta: {
            label: string
            onClick?: () => void
            to?: string
        }
    }[]
    configuration: StoreConfiguration
    sales: {
        isDisabled: boolean
        enabled: boolean
    }
    support: {
        enabled: boolean
        chat: {
            enabled: boolean
            isIntegrationMissing?: boolean
        }
        email: {
            enabled: boolean
            isIntegrationMissing?: boolean
        }
    }
}
type Props = {
    store: StoreActivation
    onSalesChange: (newValue: boolean) => void
    onSupportChange: (newValue: boolean) => void
    onSupportChatChange: (newValue: boolean) => void
    onSupportEmailChange: (newValue: boolean) => void
    isDisabled?: boolean
    closeModal: () => void
}
export const AiAgentActivationStoreCard = ({
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
    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        [],
    )
    const emailIntegrations = useAppSelector(selector)
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

    const { routes } = useAiAgentNavigation({ shopName: name })

    const isDisabledCore = isDisabled || (alerts ?? []).length > 0

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{title}</div>
                    <div className={css.enablement}>
                        {enablement.current} of {enablement.total}
                    </div>
                </div>

                {alerts?.map((alert, index) => (
                    <Alert
                        key={index}
                        className={css.alert}
                        type={alert.type}
                        icon
                        customActions={
                            alert.cta
                                ? [
                                      alert.cta.to ? (
                                          <Link
                                              key="cta"
                                              className={css.alertCta}
                                              to={alert.cta.to}
                                              onClick={closeModal}
                                          >
                                              {alert.cta.label}
                                          </Link>
                                      ) : (
                                          <span
                                              key="cta"
                                              className={css.alertCta}
                                              onClick={alert.cta.onClick}
                                          >
                                              {alert.cta.label}
                                          </span>
                                      ),
                                  ]
                                : undefined
                        }
                    >
                        {alert.message}
                    </Alert>
                ))}
            </div>

            <div className={cn(css.section, css.skillSection)}>
                <div>
                    <div className={css.heading}>
                        <div className={css.title}>Support</div>
                        <NewToggleButton
                            isDisabled={
                                isDisabledCore ||
                                (support.chat.isIntegrationMissing &&
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
                                        support.chat.isIntegrationMissing
                                    }
                                    isChecked={support.chat.enabled}
                                    onChange={onSupportChatChange}
                                >
                                    Chat
                                    {support.chat.isIntegrationMissing ? (
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
                                    ) : undefined}
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                {support.chat.isIntegrationMissing ? (
                                    <Link
                                        to={routes.settingsChannels}
                                        onClick={closeModal}
                                    >
                                        Select Integration for Chat
                                    </Link>
                                ) : (
                                    <div className={css.labelContainer}>
                                        <span>
                                            Activate Support for integrated
                                            chats.
                                        </span>
                                        {chatChannels.length > 0 && (
                                            <IconTooltip
                                                className={css.icon}
                                                tooltipProps={{
                                                    placement: 'top-start',
                                                }}
                                            >
                                                integrated chats:
                                                <div>
                                                    {chatChannels.map(
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
                                    {support.email.isIntegrationMissing ? (
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
                                    ) : undefined}
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                {support.email.isIntegrationMissing ? (
                                    <Link
                                        to={routes.settingsChannels}
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
                                        {emailItems.length > 0 && (
                                            <IconTooltip
                                                className={css.icon}
                                                tooltipProps={{
                                                    placement: 'top-start',
                                                }}
                                            >
                                                integrated emails:
                                                <div>
                                                    {emailItems.map(
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
                        <div className={css.title}>Sales</div>
                        <NewToggleButton
                            isDisabled={isDisabledCore || sales.isDisabled}
                            checked={sales.enabled}
                            onChange={onSalesChange}
                        />
                    </div>
                    <div className={css.description}>
                        Sales can only be activated when Support for Chat is
                        activated.
                    </div>
                </div>
            </div>
        </div>
    )
}
