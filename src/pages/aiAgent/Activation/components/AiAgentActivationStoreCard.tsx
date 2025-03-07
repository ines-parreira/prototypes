import React, { useState } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import CheckBox from 'pages/common/forms/CheckBox'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './AiAgentActivationStoreCard.less'

type Props = {
    store: {
        name: string
        sales: {
            enabled: boolean
            onToggle: (newValue: boolean) => void
        }
        support: {
            onToggle: (newValue: boolean) => void
            chat: {
                enabled: boolean
                integrationError?: string
                onToggle: (newValue: boolean) => void
            }
            email: {
                enabled: boolean
                integrationError?: string
                onToggle: (newValue: boolean) => void
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

    return (
        <div className={css.storeCard}>
            <div className={cn(css.section, css.headerSection)}>
                <div className={css.heading}>
                    <div className={css.title}>{store.name}</div>
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
                                        !!store.support.chat.integrationError
                                    }
                                    isChecked={store.support.chat.enabled}
                                    onChange={store.support.chat.onToggle}
                                >
                                    Chat
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                Activate Support for Chat
                            </div>
                        </div>
                        <div>
                            <div className={css.channelField}>
                                <CheckBox
                                    className={css.channelInput}
                                    labelClassName={css.channelLabel}
                                    name="support__email"
                                    isDisabled={
                                        !!store.support.email.integrationError
                                    }
                                    isChecked={store.support.email.enabled}
                                    onChange={store.support.email.onToggle}
                                >
                                    Email
                                </CheckBox>
                            </div>
                            <div className={css.channelCaption}>
                                Activate Support for Email
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
