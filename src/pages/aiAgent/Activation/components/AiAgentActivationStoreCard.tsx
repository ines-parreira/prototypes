import React, { useState } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import warningIcon from 'assets/img/icons/warning.svg'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import CheckBox from 'pages/common/forms/CheckBox'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './AiAgentActivationStoreCard.less'

type Props = {
    store: {
        name: string
        title: string
        sales: {
            enabled: boolean
            onToggle: (newValue: boolean) => void
        }
        support: {
            onToggle: (newValue: boolean) => void
            chat: {
                enabled: boolean
                onToggle: (newValue: boolean) => void
                isIntegrationMissing?: boolean
            }
            email: {
                enabled: boolean
                onToggle: (newValue: boolean) => void
                isIntegrationMissing?: boolean
            }
        }
    }
    alerts: Array<{
        type: AlertType
        message: string
        cta: {
            label: string
            onClick?: () => void
            to?: string
        }
    }>
}
export const AiAgentActivationStoreCard = ({ store, alerts }: Props) => {
    const enablementList = [
        store.sales.enabled,
        store.support.chat.enabled,
        store.support.email.enabled,
    ]
    const enablement = {
        current: enablementList.filter(Boolean).length,
        total: enablementList.length,
    }

    const [displayChannels, setDisplayChannels] = useState({ sales: false })
    const handleToggleChannels =
        (channel: keyof typeof displayChannels) => () =>
            setDisplayChannels({
                ...displayChannels,
                [channel]: !displayChannels[channel],
            })

    const { routes } = useAiAgentNavigation({ shopName: store.name })

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{store.title}</div>
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

            <div className={css.section}>
                <div className={css.heading}>
                    <div className={css.title}>Sales</div>
                    <ToggleInput
                        isToggled={store.sales.enabled}
                        onClick={store.sales.onToggle}
                    />
                </div>
                <div className={css.description}>
                    Boost sales on chat when activated.
                </div>
            </div>

            <div className={css.section}>
                <div className={css.heading}>
                    <div className={css.title}>Support</div>
                    <ToggleInput
                        isToggled={
                            store.support.chat.enabled ||
                            store.support.email.enabled
                        }
                        onClick={store.support.onToggle}
                    />
                </div>

                <div
                    className={css.toggleChannels}
                    onClick={handleToggleChannels('sales')}
                >
                    Manage channels{' '}
                    <i className={cn('material-icons', css.toggleChannelsIcon)}>
                        {displayChannels.sales
                            ? 'arrow_drop_up'
                            : 'arrow_drop_down'}
                    </i>
                </div>

                {displayChannels.sales && (
                    <div className={css.channelsList}>
                        <div className={css.channel}>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    name="support__chat"
                                    isDisabled={
                                        store.support.chat.isIntegrationMissing
                                    }
                                    isChecked={store.support.chat.enabled}
                                    onChange={store.support.chat.onToggle}
                                >
                                    Chat
                                    {store.support.chat.isIntegrationMissing ? (
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
                                {store.support.chat.isIntegrationMissing ? (
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
                                        store.support.email.isIntegrationMissing
                                    }
                                    isChecked={store.support.email.enabled}
                                    onChange={store.support.email.onToggle}
                                >
                                    Email
                                    {store.support.email
                                        .isIntegrationMissing ? (
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
                                {store.support.email.isIntegrationMissing ? (
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
                )}
            </div>
        </div>
    )
}
