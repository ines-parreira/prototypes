import React from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import warningIcon from 'assets/img/icons/warning.svg'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import CheckBox from 'pages/common/forms/CheckBox'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './AiAgentActivationStoreCard.less'

export type StoreActivation = {
    name: string
    title: string
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
    alerts: {
        type: AlertType
        message: string
        cta: {
            label: string
            onClick?: () => void
            to?: string
        }
    }[]
    onToggleSales: (newValue: boolean) => void
    onToggleSupport: (newValue: boolean) => void
    onToggleSupportChat: (newValue: boolean) => void
    onToggleSupportEmail: (newValue: boolean) => void
}
export const AiAgentActivationStoreCard = ({
    store: { name, title, support, sales },
    alerts,
    onToggleSales,
    onToggleSupport,
    onToggleSupportChat,
    onToggleSupportEmail,
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

    const { routes } = useAiAgentNavigation({ shopName: name })

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{title}</div>
                    <div className={css.enablement}>
                        {enablement.current} of {enablement.total}
                    </div>
                </div>

                {alerts.map((alert, index) => (
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
                        <ToggleInput
                            isDisabled={
                                support.chat.isIntegrationMissing &&
                                support.email.isIntegrationMissing
                            }
                            isToggled={support.enabled}
                            onClick={onToggleSupport}
                        />
                    </div>

                    <div className={css.channelsList}>
                        <div className={css.channel}>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    name="support__chat"
                                    isDisabled={
                                        support.chat.isIntegrationMissing
                                    }
                                    isChecked={support.chat.enabled}
                                    onChange={onToggleSupportChat}
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
                                    <Link to={routes.settingsChannels}>
                                        Select Integration for Chat{' '}
                                        <i className="material-icons">
                                            open_in_new
                                        </i>
                                    </Link>
                                ) : (
                                    'Activate Support for Chat'
                                )}
                            </div>
                        </div>

                        <div>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    name="support__email"
                                    isDisabled={
                                        support.email.isIntegrationMissing
                                    }
                                    isChecked={support.email.enabled}
                                    onChange={onToggleSupportEmail}
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
                                    <Link to={routes.settingsChannels}>
                                        Select Integration for Email{' '}
                                        <i className="material-icons">
                                            open_in_new
                                        </i>
                                    </Link>
                                ) : (
                                    'Activate Support for Email'
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
                        <ToggleInput
                            isDisabled={sales.isDisabled}
                            isToggled={sales.enabled}
                            onClick={onToggleSales}
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
